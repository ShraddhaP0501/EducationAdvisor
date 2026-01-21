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
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


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
        return (
            jsonify({"msg": "Email already exists or DB error", "error": str(e)}),
            400,
        )
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
        cursor.execute(
            "UPDATE users SET profile_photo=%s WHERE id=%s", (filename, user_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"msg": "File uploaded successfully", "filename": filename}), 200

    return jsonify({"msg": "File type not allowed"}), 400


# ------------------- Quiz 10TH -------------------
@app.route("/generate-quiz", methods=["GET"])
def generate_quiz():
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

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

        # ---- SAFE JSON READ ----
        data = request.get_json(silent=True) or {}
        answers = data.get("answers", {})

        if not answers:
            return (
                jsonify(
                    {
                        "suggestion": "Please answer the quiz questions first",
                        "reason": "",
                    }
                ),
                400,
            )

        prompt = f"""
You are a career advisor. Based on the student's situational answers:

{answers}

Map the student to ONE best stream:
- Science-Maths: interest in mathematics, problem-solving, experiments, coding
- Science-Biology: interest in biology, healthcare, nature, medicine
- Commerce: interest in business, finance, planning, entrepreneurship
- Arts: interest in creativity, literature, social issues, humanities
- Diploma: interest in hands-on practical skills, tools, vocational work

Rules:
1. Suggest ONLY one best stream.
2. Give a short reason (1–2 sentences).

Return ONLY valid JSON:
{{
  "suggestion": "string",
  "reason": "string"
}}
"""

        # ---- GEMINI CALL ----
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # ---- SAFE JSON EXTRACTION ----
        import re

        match = re.search(r"\{[\s\S]*\}", raw_text)
        if not match:
            raise ValueError("No valid JSON returned from Gemini")

        try:
            result_data = json.loads(match.group(0))
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON from Gemini")

        suggestion = result_data.get("suggestion", "")
        reason = result_data.get("reason", "")

        # ---- DB SAVE ----
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO quiz_results
            (user_id, answers, suggestion, quiz_type)
            VALUES (%s, %s, %s, %s)
            """,
            (user_id, json.dumps(answers), suggestion, "10th"),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"suggestion": suggestion, "reason": reason})

    except Exception as e:
        print("❌ Error in /evaluate-quiz:", e)
        return (
            jsonify({"suggestion": "Server error while evaluating quiz", "reason": ""}),
            500,
        )

    # ------------------- Quiz for 12th Science (Maths) -------------------


@app.route("/generate-quiz-12maths", methods=["GET"])
def generate_quiz_12maths():
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

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

        # ---- SAFE JSON READ ----
        data = request.get_json(silent=True) or {}
        answers = data.get("answers", {})

        if not answers:
            return (
                jsonify(
                    {
                        "primary_suggestion": "Please answer the quiz questions first",
                        "primary_reason": "",
                        "alternate_suggestions": [],
                    }
                ),
                400,
            )

        prompt = f"""
You are a career advisor. Based on the student's situational answers:

{answers}

Map their interests to the most appropriate career/degree. Consider:

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

Rules:
1. Suggest ONE primary career path.
2. Suggest 2–3 alternate paths if applicable.
3. Provide short reasons (1–2 sentences).

Return ONLY valid JSON:
{{
  "primary_suggestion": "string",
  "primary_reason": "string",
  "alternate_suggestions": [
    {{ "career": "string", "reason": "string" }}
  ]
}}
"""

        # ---- GEMINI CALL ----
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # ---- SAFE JSON EXTRACTION ----
        import re

        match = re.search(r"\{[\s\S]*\}", raw_text)
        if not match:
            raise ValueError("No valid JSON returned from Gemini")

        result_data = json.loads(match.group(0))

        primary_suggestion = result_data.get("primary_suggestion", "")
        primary_reason = result_data.get("primary_reason", "")
        alternate_suggestions = result_data.get("alternate_suggestions", [])

        if not isinstance(alternate_suggestions, list):
            alternate_suggestions = []

        # ---- DB SAVE ----
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
                json.dumps(alternate_suggestions),
                "12th-maths",
            ),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify(
            {
                "primary_suggestion": primary_suggestion,
                "primary_reason": primary_reason,
                "alternate_suggestions": alternate_suggestions,
            }
        )

    except Exception as e:
        print("❌ Error in /evaluate-quiz-12maths:", e)
        return (
            jsonify(
                {
                    "primary_suggestion": "Server error while evaluating quiz",
                    "primary_reason": "",
                    "alternate_suggestions": [],
                }
            ),
            500,
        )

    # ------------------- Quiz for 12th Science (Biology) -------------------


@app.route("/generate-quiz-12biology", methods=["GET"])
def generate_quiz_12biology():
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = """Generate 10 multiple-choice career guidance questions 
        for 12th standard Indian students with Science-Biology (PCB) background
        who are unsure about their career options. Include all possible options:

        - MBBS / BDS / AYUSH
        - Nursing / Paramedical
        - Biotechnology / Biomedical Science
        - B.Sc Biology / Microbiology / Zoology / Botany
        - Pharmacy
        - Public Health / Hospital Administration
        - Research / Teaching
        - Veterinary Science
        - Environmental Science / Life Sciences
        - Government & Competitive Exams (NEET-based roles)

        Instructions:
        1. Questions should assess interest in patient care, lab work, research, field work, memorization, social service, and long-term study commitment.
        2. Each question must have exactly 4 situational options.
        3. Do NOT mention degree names directly in options.

        Return ONLY valid JSON in this format:

        {
            "questions": [
                {
                    "question": "string",
                    "options": ["option1", "option2", "option3", "option4"]
                }
            ]
        }
        """

        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        try:
            data = json.loads(raw_text)
            questions = data.get("questions", [])
        except json.JSONDecodeError:
            questions = []

        valid_questions = []
        for q in questions:
            if isinstance(q, dict) and "question" in q and "options" in q:
                if isinstance(q["options"], list) and len(q["options"]) == 4:
                    valid_questions.append(q)

        return jsonify({"questions": valid_questions})

    except Exception as e:
        print("Error generating quiz 12biology:", e)
        return jsonify({"questions": []})


@app.route("/evaluate-quiz-12biology", methods=["POST"])
@jwt_required()
def evaluate_quiz_12biology():
    try:
        user_id = get_jwt_identity()

        # ---- SAFE JSON READ ----
        data = request.get_json(silent=True) or {}
        answers = data.get("answers", {})

        if not answers:
            return (
                jsonify(
                    {
                        "primary_suggestion": "Please answer the quiz questions first",
                        "primary_reason": "",
                        "alternate_suggestions": [],
                    }
                ),
                400,
            )

        prompt = f"""
You are a career advisor. Based on the student's situational answers:

{answers}

Consider Biology-based career paths:
- MBBS / BDS / AYUSH
- Nursing / Paramedical
- Pharmacy
- Biotechnology / Biomedical Science
- B.Sc Biology / Microbiology / Zoology / Botany
- Research / Teaching
- Veterinary Science
- Public Health / Hospital Administration
- Environmental & Life Sciences
- Government & Competitive Exams

Rules:
1. Suggest ONE primary career path.
2. Suggest 2–3 alternate paths if applicable.
3. Provide short reasons (1–2 sentences).

Return ONLY valid JSON:
{{
  "primary_suggestion": "string",
  "primary_reason": "string",
  "alternate_suggestions": [
    {{ "career": "string", "reason": "string" }}
  ]
}}
"""

        # ---- GEMINI CALL ----
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # ---- SAFE JSON EXTRACTION ----
        import re

        match = re.search(r"\{[\s\S]*\}", raw_text)
        if not match:
            raise ValueError("No valid JSON returned from Gemini")

        result_data = json.loads(match.group(0))

        primary_suggestion = result_data.get("primary_suggestion", "")
        primary_reason = result_data.get("primary_reason", "")
        alternate_suggestions = result_data.get("alternate_suggestions", [])

        if not isinstance(alternate_suggestions, list):
            alternate_suggestions = []

        # ---- DB SAVE ----
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
                json.dumps(alternate_suggestions),
                "12th-biology",
            ),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify(
            {
                "primary_suggestion": primary_suggestion,
                "primary_reason": primary_reason,
                "alternate_suggestions": alternate_suggestions,
            }
        )

    except Exception as e:
        print("❌ Error in /evaluate-quiz-12biology:", e)
        return (
            jsonify(
                {
                    "primary_suggestion": "Server error while evaluating quiz",
                    "primary_reason": "",
                    "alternate_suggestions": [],
                }
            ),
            500,
        )


# ------------------- Quiz for ARTS -------------------


@app.route("/generate-quiz-arts", methods=["GET"])
def generate_quiz_arts():
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = """Generate 10 multiple-choice career guidance questions 
        for Indian students from Arts / Humanities background 
        who are unsure about career options.

        Cover paths like:
        - BA (Psychology, Sociology, History, Political Science, Economics)
        - Law
        - Journalism / Mass Communication
        - Design / Fine Arts / Performing Arts
        - Civil Services / Government Exams
        - Teaching / Academia
        - Social Work / NGO / Public Policy
        - Content Writing / Media / Digital Marketing
        - Management / BBA
        - Creative & Liberal Arts careers

        Instructions:
        1. Questions should assess creativity, communication, analytical thinking,
           leadership, social awareness, public speaking, writing, and research interest.
        2. Each question must have exactly 4 situational options.
        3. Do NOT mention degree names directly in options.

        Return ONLY valid JSON:
        {
          "questions": [
            {
              "question": "string",
              "options": ["option1", "option2", "option3", "option4"]
            }
          ]
        }
        """

        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        try:
            data = json.loads(raw_text)
            questions = data.get("questions", [])
        except json.JSONDecodeError:
            questions = []

        valid_questions = []
        for q in questions:
            if isinstance(q, dict) and "question" in q and "options" in q:
                if isinstance(q["options"], list) and len(q["options"]) == 4:
                    valid_questions.append(q)

        return jsonify({"questions": valid_questions})

    except Exception as e:
        print("Error generating quiz arts:", e)
        return jsonify({"questions": []})


@app.route("/evaluate-quiz-arts", methods=["POST"])
@jwt_required()
def evaluate_quiz_arts():
    try:
        user_id = get_jwt_identity()

        # ---- SAFE JSON READ ----
        data = request.get_json(silent=True) or {}
        answers = data.get("answers", {})

        if not answers:
            return (
                jsonify(
                    {
                        "primary_suggestion": "Please answer the quiz questions first",
                        "primary_reason": "",
                        "alternate_suggestions": [],
                    }
                ),
                400,
            )

        prompt = f"""
You are a career advisor. Based on the student's situational answers:

{answers}

Consider Arts & Humanities career paths:
- Psychology / Sociology / Humanities
- Law
- Journalism / Mass Communication
- Design / Fine & Performing Arts
- Teaching / Academia
- Civil Services / Government Exams
- Social Work / NGOs / Public Policy
- Content Writing / Media / Digital Marketing
- Management / BBA
- Liberal Arts & Creative careers

Rules:
1. Suggest ONE primary career path.
2. Suggest 2–3 alternate paths if applicable.
3. Provide short reasons (1–2 sentences).

Return ONLY valid JSON:
{{
  "primary_suggestion": "string",
  "primary_reason": "string",
  "alternate_suggestions": [
    {{ "career": "string", "reason": "string" }}
  ]
}}
"""

        # ---- GEMINI CALL ----
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # ---- SAFE JSON EXTRACTION ----
        import re

        match = re.search(r"\{[\s\S]*\}", raw_text)
        if not match:
            raise ValueError("No valid JSON returned from Gemini")

        try:
            result_data = json.loads(match.group(0))
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON from Gemini")

        primary_suggestion = result_data.get("primary_suggestion", "")
        primary_reason = result_data.get("primary_reason", "")
        alternate_suggestions = result_data.get("alternate_suggestions", [])

        if not isinstance(alternate_suggestions, list):
            alternate_suggestions = []

        # ---- DB SAVE ----
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
                json.dumps(alternate_suggestions),
                "arts",
            ),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify(
            {
                "primary_suggestion": primary_suggestion,
                "primary_reason": primary_reason,
                "alternate_suggestions": alternate_suggestions,
            }
        )

    except Exception as e:
        print("❌ Error in /evaluate-quiz-arts:", e)
        return (
            jsonify(
                {
                    "primary_suggestion": "Server error while evaluating quiz",
                    "primary_reason": "",
                    "alternate_suggestions": [],
                }
            ),
            500,
        )


# ------------------- Quiz for Commerce -------------------
@app.route("/generate-quiz-commerce", methods=["GET"])
def generate_quiz_commerce():
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = """Generate 10 multiple-choice career guidance questions 
        for Indian students from Commerce background 
        who are unsure about their career options.

        Cover paths like:
        - B.Com / Accounting / Finance
        - CA / CS / CMA
        - Banking / Finance / Insurance
        - Economics / Statistics
        - Business Analytics / Data Analysis
        - Management / BBA / MBA
        - Entrepreneurship / Startups
        - Marketing / Sales / Digital Marketing
        - Government & Competitive Exams
        - Teaching / Academia

        Instructions:
        1. Questions should assess interest in numbers, analysis, business strategy,
           finance, risk-taking, leadership, management, and entrepreneurship.
        2. Each question must have exactly 4 situational options.
        3. Do NOT mention degree names directly in options.

        Return ONLY valid JSON:
        {
          "questions": [
            {
              "question": "string",
              "options": ["option1", "option2", "option3", "option4"]
            }
          ]
        }
        """

        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        try:
            data = json.loads(raw_text)
            questions = data.get("questions", [])
        except json.JSONDecodeError:
            questions = []

        valid_questions = []
        for q in questions:
            if isinstance(q, dict) and "question" in q and "options" in q:
                if isinstance(q["options"], list) and len(q["options"]) == 4:
                    valid_questions.append(q)

        return jsonify({"questions": valid_questions})

    except Exception as e:
        print("Error generating quiz commerce:", e)
        return jsonify({"questions": []})


@app.route("/evaluate-quiz-commerce", methods=["POST"])
@jwt_required()
def evaluate_quiz_commerce():
    try:
        user_id = get_jwt_identity()

        # ---- SAFE JSON READ ----
        data = request.get_json(silent=True) or {}
        answers = data.get("answers", {})

        if not answers:
            return (
                jsonify(
                    {
                        "primary_suggestion": "Please answer the quiz questions first",
                        "primary_reason": "",
                        "alternate_suggestions": [],
                    }
                ),
                400,
            )

        prompt = f"""
You are a career advisor. Based on the student's situational answers:

{answers}

Consider Commerce career paths:
- Accounting / Finance
- CA / CS / CMA
- Banking / Insurance
- Economics / Statistics
- Business Analytics / Data Analysis
- Management / BBA / MBA
- Entrepreneurship / Startups
- Marketing / Sales / Digital Marketing
- Teaching / Academia
- Government & Competitive Exams

Rules:
1. Suggest ONE primary career path.
2. Suggest 2–3 alternate paths if applicable.
3. Provide short reasons (1–2 sentences).

Return ONLY valid JSON:
{{
  "primary_suggestion": "string",
  "primary_reason": "string",
  "alternate_suggestions": [
    {{ "career": "string", "reason": "string" }}
  ]
}}
"""

        # ---- GEMINI CALL ----
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # ---- SAFE JSON EXTRACTION ----
        import re

        match = re.search(r"\{[\s\S]*\}", raw_text)
        if not match:
            raise ValueError("No valid JSON returned from Gemini")

        try:
            result_data = json.loads(match.group(0))
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON from Gemini")

        primary_suggestion = result_data.get("primary_suggestion", "")
        primary_reason = result_data.get("primary_reason", "")
        alternate_suggestions = result_data.get("alternate_suggestions", [])

        if not isinstance(alternate_suggestions, list):
            alternate_suggestions = []

        # ---- DB SAVE ----
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
                json.dumps(alternate_suggestions),
                "commerce",
            ),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify(
            {
                "primary_suggestion": primary_suggestion,
                "primary_reason": primary_reason,
                "alternate_suggestions": alternate_suggestions,
            }
        )

    except Exception as e:
        print("❌ Error in /evaluate-quiz-commerce:", e)
        return (
            jsonify(
                {
                    "primary_suggestion": "Server error while evaluating quiz",
                    "primary_reason": "",
                    "alternate_suggestions": [],
                }
            ),
            500,
        )


# ------------------- Get User Quiz Results -------------------
@app.route("/user-quiz-results", methods=["GET"])
@jwt_required()
def get_user_quiz_results():
    try:
        user_id = get_jwt_identity()
        quiz_type = request.args.get(
            "quiz_type"
        )  # optional filter: '10th' or '12th-maths'

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if quiz_type:
            cursor.execute(
                "SELECT suggestion, primary_reason, alternate_suggestions, quiz_type, created_at FROM quiz_results WHERE user_id=%s AND quiz_type=%s ORDER BY created_at DESC",
                (user_id, quiz_type),
            )
        else:
            cursor.execute(
                "SELECT suggestion, primary_reason, alternate_suggestions, quiz_type, created_at FROM quiz_results WHERE user_id=%s ORDER BY created_at DESC",
                (user_id,),
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
