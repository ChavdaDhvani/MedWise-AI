from flask import Flask, request, render_template, jsonify
import pandas as pd

app = Flask(__name__)

CSV_PATH = r"C:/MedWise-AI/dataset_clean1.csv"

@app.route('/')
def index():
    return render_template("main.html")

@app.route('/image', methods=['POST'])
def solve():
    img = request.files.get('file', '')
    annotation = drug_extraction(img)
    print(type(annotation))
    return jsonify(annotation.get_entity_annotations(return_dictionary=True))

@app.route('/find', methods=['POST'])
def find_symptoms():
    try:
        # Load CSV data
        df = pd.read_csv(CSV_PATH, names=["disease", "symptom", "number"])

        # Get user symptoms from request
        user_symptoms = request.get_json().get('symptoms', [])
        user_symptoms = set(user_symptoms)  # Convert list to set for easy lookup

        # Find all numbers associated with the user symptoms
        matched_rows = df[df["symptom"].isin(user_symptoms)]
        related_numbers = matched_rows["number"].unique()

        if len(related_numbers) == 0:
            return jsonify({"suggested_symptoms": []})  # No matches found

        # Find all symptoms with the same numbers
        related_symptoms = df[df["number"].isin(related_numbers)]["symptom"].unique()

        # Remove already selected symptoms
        suggested_symptoms = list(set(related_symptoms) - user_symptoms)

        return jsonify({"suggested_symptoms": suggested_symptoms[:4]})  # Return top 8 suggestions

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/disease', methods=['POST'])
def search():
    try:
        df = pd.read_csv(CSV_PATH, names=["disease", "symptom", "number"])

        user_symptoms = request.get_json().get('symptoms', [])
        user_symptoms = set(user_symptoms)

        matched_rows = df[df["symptom"].isin(user_symptoms)]

        if matched_rows.empty:
            return render_template("result.html", disease="No matching disease found.")

        # Find the most frequently occurring number
        most_common_number = matched_rows["number"].value_counts().idxmax()

        # Get the corresponding disease
        disease = df[df["number"] == most_common_number]["disease"].iloc[0]

        return render_template("result.html", disease=disease)

    except Exception as e:
        return render_template("result.html", disease="Error: " + str(e))

if __name__ == '__main__':
    app.run(debug=True, port=3000)
