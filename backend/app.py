from flask import Flask, request, jsonify, send_from_directory
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.utils import secure_filename
import pymysql
import os
from dotenv import load_dotenv

# -------------------------------
# Load environment variables
# -------------------------------
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# -------------------------------
# JWT Config
# -------------------------------
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "supersecret123")

# -------------------------------
# Upload Config
# -------------------------------
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# -------------------------------
# MySQL Connection Helper
# -------------------------------
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor
    )

# -------------------------------
# User Signup Route
# -------------------------------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    full_name = data.get('full_name')
    email = data.get('email')
    birthday = data.get('birthday')
    standard = data.get('standard')
    password = data.get('password')

    if not (full_name and email and birthday and password):
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        db.close()
        return jsonify({"error": "Email already exists"}), 409

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    cursor.execute(
        "INSERT INTO users (full_name, email, birthday, standard, password_hash) VALUES (%s, %s, %s, %s, %s)",
        (full_name, email, birthday, standard, pw_hash)
    )
    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "User registered successfully"}), 201

# -------------------------------
# User Login Route
# -------------------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT id, full_name, email, password_hash FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user or not bcrypt.check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity={"id": user['id'], "name": user['full_name'], "email": user['email']})
    return jsonify({"token": access_token}), 200

# -------------------------------
# Protected Dashboard Route
# -------------------------------
@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()

    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(
        "SELECT full_name, email, birthday, standard, profile_photo FROM users WHERE id = %s",
        (current_user['id'],)
    )
    user_data = cursor.fetchone()
    cursor.close()
    db.close()

    if user_data:
        photo_url = f"http://localhost:5000/uploads/{user_data['profile_photo']}" if user_data['profile_photo'] else None
        return jsonify({
            "message": "Welcome to your dashboard!",
            "user": {
                "id": current_user["id"],
                "name": user_data["full_name"],
                "email": user_data["email"],
                "birthday": user_data["birthday"],
                "standard": user_data["standard"],
                "profile_photo": photo_url
            }
        })
    else:
        return jsonify({"error": "User not found"}), 404

# -------------------------------
# Upload Profile Photo
# -------------------------------
@app.route("/api/upload-photo", methods=["POST"])
@jwt_required()
def upload_photo():
    current_user = get_jwt_identity()
    if "photo" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["photo"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{current_user['id']}_{file.filename}")
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("UPDATE users SET profile_photo = %s WHERE id = %s", (filename, current_user['id']))
        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Photo uploaded successfully", "filename": filename}), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400

# -------------------------------
# Serve uploaded files
# -------------------------------
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# -------------------------------
# Run Flask
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)