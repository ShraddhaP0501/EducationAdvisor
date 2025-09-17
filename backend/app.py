from flask import Flask, request, jsonify
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

# Load environment variables
load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# MySQL config
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", 3306))

jwt = JWTManager(app)

# Inactivity limit
INACTIVITY_LIMIT = timedelta(minutes=30)

# Upload folder
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# MySQL connection helper
def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, port=DB_PORT
    )


# Middleware: inactivity check
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

            # Update last activity
            cursor.execute(
                "UPDATE user_sessions SET last_activity=%s WHERE user_id=%s",
                (datetime.utcnow(), int(user_id)),
            )
            conn.commit()

        cursor.close()
        conn.close()
    except Exception:
        return


# Register route
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


# Login route
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

    # Create access token (identity must be string)
    access_token = create_access_token(identity=str(user["id"]))

    # Save session
    cursor.execute(
        "INSERT INTO user_sessions (user_id, token, last_activity) VALUES (%s, %s, %s)",
        (user["id"], access_token, datetime.utcnow()),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(access_token=access_token, user_id=user["id"]), 200


# Profile route
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


# Logout route
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


# Upload photo route
@app.route("/upload-photo", methods=["POST"])
@jwt_required()
def upload_photo():
    if "photo" not in request.files:
        return jsonify({"msg": "No file part"}), 400

    file = request.files["photo"]
    if file.filename == "":
        return jsonify({"msg": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # Save filename to user table
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


if __name__ == "__main__":
    app.run(debug=True)
