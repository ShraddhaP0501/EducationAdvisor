from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request,
)
from flask_cors import CORS
from passlib.hash import pbkdf2_sha256
from datetime import datetime, timedelta
import mysql.connector
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import google.generativeai as genai
import json
import uuid

# Load environment variables
load_dotenv()

# ------------------- Flask Setup -------------------
app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# ------------------- MySQL Config -------------------
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", 3306))

jwt = JWTManager(app)
INACTIVITY_LIMIT = timedelta(minutes=30)

# ------------------- Upload Setup -------------------
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ------------------- Gemini API -------------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ------------------- Helpers -------------------
def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, port=DB_PORT
    )

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ------------------- Routes -------------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.before_request
def check_inactivity():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if not user_id:
            return

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT last_activity FROM user_sessions WHERE user_id=%s", (int(user_id),)
        )
        session = cursor.fetchone()

        if session:
            last_activity = session["last_activity"]
            if datetime.utcnow() - last_activity > INACTIVITY_LIMIT:
                cursor.execute(
                    "DELETE FROM user_sessions WHERE user_id=%s", (int(user_id),)
                )
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"msg": "Session expired due to inactivity"}), 401

            cursor.execute(
                "UPDATE user_sessions SET last_activity=%s WHERE user_id=%s",
                (datetime.utcnow(), int(user_id)),
            )
            conn.commit()

        cursor.close()
        conn.close()
    except Exception:
        return

# ------------------- User Auth -------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    birthday = data.get("birthday")
    standard = data.get("standard")
    password = data.get("password")

    if not all([full_name, email, birthday, password]):
        return jsonify({"msg": "Missing required fields"}), 400

    password_hash = pbkdf2_sha256.hash(password)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO users (full_name, email, birthday, standard, password_hash) VALUES (%s, %s, %s, %s, %s)",
            (full_name, email, birthday, standard, password_hash),
        )
        conn.commit()
        return jsonify({"msg": "User registered successfully"}), 201
    except mysql.connector.Error as e:
        return jsonify({"msg": "Email already exists or DB error", "error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user or not pbkdf2_sha256.verify(password, user["password_hash"]):
        cursor.close()
        conn.close()
        return jsonify({"msg": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user["id"]))

    cursor.execute(
        "INSERT INTO user_sessions (user_id, token, last_activity) VALUES (%s, %s, %s)",
        (user["id"], access_token, datetime.utcnow()),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(access_token=access_token, user_id=user["id"]), 200

@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, full_name, email, birthday, standard, profile_photo FROM users WHERE id=%s",
        (user_id,),
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    user_data = {
        "id": user[0],
        "full_name": user[1],
        "email": user[2],
        "birthday": user[3],
        "standard": user[4],
        "profile_photo": user[5] if user[5] else None,
    }
    return jsonify(user_data), 200

@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("DELETE FROM user_sessions WHERE user_id=%s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "Logged out"}), 200

# ------------------- Upload -------------------
@app.route("/upload-photo", methods=["POST"])
@jwt_required()
def upload_photo():
    if "photo" not in request.files:
        return jsonify({"msg": "No file part"}), 400

    file = request.files["photo"]
    if file.filename == "":
        return jsonify({"msg": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        user_id = int(get_jwt_identity())
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("UPDATE users SET profile_photo=%s WHERE id=%s", (filename, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"msg": "File uploaded successfully", "filename": filename}), 200

    return jsonify({"msg": "File type not allowed"}), 400

# ------------------- Quiz -------------------
@app.route("/generate-quiz", methods=["GET"])
def generate_quiz():
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

        prompt = """Generate 10 multiple-choice career aptitude questions 
        for 10th grade Indian students who are unsure about their future stream.
        Make questions simple, relatable, and helpful for understanding personal 
        interests. Use real-life situations, hobbies, or preferences rather than abstract problems.
        Each question should have 4 situational options (not stream names). 
        Return ONLY valid JSON in this format:

        {
            "questions": [
                {
                    "question": "string",
                    "options": ["situation 1", "situation 2", "situation 3", "situation 4"]
                }
            ]
        }"""

        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Remove markdown code block markers if present
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # Parse JSON safely
        try:
            data = json.loads(raw_text)
            questions = data.get("questions", [])
        except json.JSONDecodeError as e:
            print("Failed to parse quiz JSON:", e)
            questions = []

        # Validate questions
        valid_questions = []
        for q in questions:
            if isinstance(q, dict) and "question" in q and "options" in q:
                if isinstance(q["options"], list) and len(q["options"]) == 4:
                    valid_questions.append(q)

        return jsonify({"questions": valid_questions})

    except Exception as e:
        print("Error generating quiz:", e)
        return jsonify({"questions": []})



@app.route("/evaluate-quiz", methods=["POST"])
@jwt_required()
def evaluate_quiz_route():
    try:
        user_id = get_jwt_identity()
        answers = request.json.get("answers", {})

        # Construct a rule-based prompt
        prompt = f"""
You are a career advisor. Based on the student's selected situational options:

{answers}

Map each answer to the most appropriate stream:
- Science-Maths: if answers show interest in math, experiments, coding, science projects
- Science-Biology: if answers show interest in biology, healthcare, nature, medicine
- Commerce: if answers show interest in business, finance, planning, entrepreneurship
- Arts: if answers show interest in creativity, literature, social issues, arts
- Diploma: if answers show interest in hands-on practical skills or vocational activities

Suggest **only one best stream** for the student with a **short reason** (1-2 sentences).
Return the result as JSON in this format:
{{
    "suggestion": "Science-Maths",
    "reason": "Student enjoys problem-solving and experiments, which suits Science-Maths."
}}
"""

        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Remove code blocks if present
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # Parse safely
        try:
            data = json.loads(raw_text)
            suggestion = data.get("suggestion", "Unknown")
            reason = data.get("reason", "")
        except json.JSONDecodeError:
            suggestion = "Unknown"
            reason = ""

        # Store in DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
        "INSERT INTO quiz_results (user_id, answers, suggestion, quiz_type) VALUES (%s, %s, %s, %s)",
        (user_id, json.dumps(answers), suggestion, "10th")
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"suggestion": suggestion, "reason": reason})

    except Exception as e:
        print("Error in /evaluate-quiz:", e)
        return jsonify({"suggestion": "Failed to evaluate quiz", "reason": ""}), 500
    


    # ------------------- Quiz for 12th Science (Maths) -------------------

@app.route("/generate-quiz-12maths", methods=["GET"])
def generate_quiz_12maths():
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

        prompt = """Generate 10 multiple-choice career guidance questions 
        for 12th standard Indian students with Science-Maths (PCM) background
        who are unsure about their career options. Include all possible options:

        - Engineering branches: Mechanical, Civil, Computer Science, Electrical, AI/ML, Data Science, Aerospace, Mechatronics, Robotics, Biotechnology
        - Computer Science / BCA / IT
        - B.Sc Physics, Maths, Chemistry, IT
        - Data Science / AI / Actuarial Science
        - Architecture / Design
        - Aviation / Pilot / Aerospace
        - Defense / Armed Forces
        - Management / BBA / Business
        - Government Services
        - Other Science Degrees (labs, teaching, applied sciences)

        Instructions for questions:
        1. Questions should explore student's interests in problem-solving, coding, analytical thinking, creativity, design, leadership, practical skills, risk-taking, and future goals.
        2. Each question must have 4 situational options (do NOT use direct degree names).
        3. Ensure questions allow mapping to **both primary and alternate career paths**.

        Return ONLY valid JSON in this format:

        {{
            "questions": [
                {{
                    "question": "string",
                    "options": ["situation 1", "situation 2", "situation 3", "situation 4"]
                }}
            ]
        }}"""

        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Remove markdown code block markers if present
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # Parse JSON safely
        try:
            data = json.loads(raw_text)
            questions = data.get("questions", [])
        except json.JSONDecodeError as e:
            print("Failed to parse quiz JSON:", e)
            questions = []

        # Validate questions
        valid_questions = []
        for q in questions:
            if isinstance(q, dict) and "question" in q and "options" in q:
                if isinstance(q["options"], list) and len(q["options"]) == 4:
                    valid_questions.append(q)

        return jsonify({"questions": valid_questions})

    except Exception as e:
        print("Error generating quiz 12maths:", e)
        return jsonify({"questions": []})


@app.route("/evaluate-quiz-12maths", methods=["POST"])
@jwt_required()
def evaluate_quiz_12maths():
    try:
        user_id = get_jwt_identity()
        answers = request.json.get("answers", {})

        prompt = f"""
You are a career advisor. Based on the student's situational answers:

{answers}

Map their interests to the most appropriate career/degree. Consider the following paths:

- Engineering (Mechanical, Civil, Computer Science, Electrical, AI/ML, Data Science, Aerospace, Mechatronics, Robotics, Biotechnology)
- Computer Science / BCA / IT
- B.Sc Physics, Maths, Chemistry, IT
- Data Science / AI / Actuarial Science
- Architecture / Design
- Aviation / Pilot / Aerospace
- Defense / Armed Forces
- Management / BBA / Business
- Government Services
- Other Science Degrees (labs, teaching, applied sciences)

Rules for suggestion:
1. Suggest **one primary career/degree** based on strongest interests.
2. Suggest **2–3 alternate options** if the student's interests are close to multiple paths.
3. Include **short reasons** for both primary and alternates (1–2 sentences each).

Return ONLY valid JSON in this format:
{{
    "primary_suggestion": "string",
    "primary_reason": "string",
    "alternate_suggestions": [
        {{
            "career": "string",
            "reason": "string"
        }}
    ]
}}
"""

        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Extract JSON block if model adds extra text
        import re
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            raw_text = match.group(0)

        # Parse JSON safely
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError as e:
            print("JSON parsing error:", e)
            print("Response causing error:", raw_text)
            return jsonify({
                "primary_suggestion": "Failed to evaluate quiz",
                "primary_reason": "",
                "alternate_suggestions": []
            }), 500

        primary_suggestion = data.get("primary_suggestion", "Unknown")
        primary_reason = data.get("primary_reason", "")
        alternate_suggestions = data.get("alternate_suggestions", [])

        # Ensure alternate_suggestions is a list
        if not isinstance(alternate_suggestions, list):
            alternate_suggestions = []

        # Store in DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO quiz_results 
            (user_id, answers, suggestion, primary_reason, alternate_suggestions, quiz_type) 
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                json.dumps(answers),
                primary_suggestion,
                primary_reason,
                json.dumps(alternate_suggestions),  # store as JSON string
                "12th-maths"
            )
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "primary_suggestion": primary_suggestion,
            "primary_reason": primary_reason,
            "alternate_suggestions": alternate_suggestions
        })

    except Exception as e:
        print("Error in /evaluate-quiz-12maths:", e)
        return jsonify({
            "primary_suggestion": "Failed to evaluate quiz",
            "primary_reason": "",
            "alternate_suggestions": []
        }), 500




@app.route("/user-quiz-results", methods=["GET"])
@jwt_required()
def get_user_quiz_results():
    try:
        user_id = get_jwt_identity()
        quiz_type = request.args.get("quiz_type")  # optional filter: '10th' or '12th-maths'

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if quiz_type:
            cursor.execute(
                "SELECT suggestion, primary_reason, alternate_suggestions, quiz_type, created_at FROM quiz_results WHERE user_id=%s AND quiz_type=%s ORDER BY created_at DESC",
                (user_id, quiz_type)
            )
        else:
            cursor.execute(
                "SELECT suggestion, primary_reason, alternate_suggestions, quiz_type, created_at FROM quiz_results WHERE user_id=%s ORDER BY created_at DESC",
                (user_id,)
            )

        results = cursor.fetchall()
        cursor.close()
        conn.close()

        # Convert JSON string to Python objects for alternate_suggestions if needed
        for r in results:
            if r.get("alternate_suggestions"):
                try:
                    r["alternate_suggestions"] = json.loads(r["alternate_suggestions"])
                except Exception:
                    r["alternate_suggestions"] = []

        return jsonify({"results": results})

    except Exception as e:
        print("Error in /user-quiz-results:", e)
        return jsonify({"results": []}), 500



# ------------------- Run App -------------------
if __name__ == "__main__":
    app.run(debug=True)
