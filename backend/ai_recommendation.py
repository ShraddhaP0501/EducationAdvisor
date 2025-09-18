# ai_recommendation.py
from flask import Blueprint, request, jsonify
import openai

ai_bp = Blueprint("ai_bp", __name__, url_prefix="/api")

# Set your OpenAI API key here or via environment variable
openai.api_key = "YOUR_OPENAI_KEY"

@ai_bp.route("/getAIRecommendation", methods=["POST"])
def get_ai_recommendation():
    data = request.json
    answers = data.get("answers", [])

    if not answers:
        return jsonify({"recommendation": "No answers received."}), 400

    # Build prompt for GPT
    prompt = "A student answered the following quiz questions:\n"
    for q in answers:
        prompt += f"Q: {q['question']}\nA: {q['answer']}\n"
    prompt += (
        "Based on these answers, recommend the best stream (Science, Commerce, Arts) "
        "and explain why this stream fits the student's interests."
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=400
        )
        recommendation = response['choices'][0]['message']['content']
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        print("OpenAI API error:", e)
        return jsonify({"recommendation": "Could not generate AI recommendation at this time."}), 500
