from flask import Flask, request, render_template, jsonify
from backend.medicine_extractor import *
from backend.symptoms import *
import json
import pandas as pd

b, c, d = None, None, None

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("main.html")

@app.route('/image', methods=['POST'])
def solve():
    img = request.files.get('file', '')
    annotation = drug_extraction(img)
    print(type(annotation))
    return jsonify(annotation.get_entity_annotations(return_dictionary=True))

@app.route('/disease', methods=['POST'])
def search():
    global b, c, d
    data = request.get_json().get('symptoms', [])
    a, b, c, d = solver(data)
    return jsonify(a)

CSV_PATH = r"C:/MedWise-AI/dataset_clean1.csv"

@app.route('/find', methods=['POST'])
def find_symptoms():
    try:
        # Load CSV data
        df = pd.read_csv(CSV_PATH)

        # Assuming the first column contains symptoms
        symptom_list = df.iloc[:, 0].dropna().tolist()

        return jsonify({"symptoms": symptom_list})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/find', methods=['POST'])
def super():
    data = request.get_json().get('symptoms', [])
    print(data)
    return react_out(data, b, c, d)

if __name__ == '__main__':
    app.run(debug=True, port=3000)
