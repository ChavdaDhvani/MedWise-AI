# 💊 MedWise-AI

**AI-Powered Health Assessment & Prescription Parser**

MedWise-AI is a smart healthcare assistant designed to provide preliminary health assessments based on symptoms and to extract medicine-related information from prescription images using OCR and NLP.

---

## 🚀 Features

### 🧠 Symptom-Based Disease Prediction
- Ask follow-up questions to refine symptom input
- Use AI to predict potential diseases
- Guide users towards better awareness of their condition

### 📷 Prescription Parsing
- Upload a prescription image
- Extract medicine names and dosages using OCR and NLP
- Visualize structured information from messy handwritten prescriptions

### 🔐 Authentication
- Google login integration for secure user access

---

## 🏗️ Tech Stack

| Area      | Technology                                   |
|-----------|----------------------------------------------|
| Backend   | Python, Flask                               |
| Frontend  | HTML, CSS, JavaScript                       |
| NLP       | Custom drug name extraction using NLP       |
| OCR       | EasyOCR                                      |


---

## 🔍 How It Works

1. **User logs in** using Google.
2. On the homepage (`main.html`), users can:
   - Enter symptoms for disease prediction
   - Upload a prescription image for medicine parsing
3. Prescription data is processed by `drug_extraction(img)` in `medicine_extractor.py`.
4. Results are shown directly on the main page.

---

## 🛠️ Installation

1. Clone the repo 

    ```bash
    git clone https://github.com/hetvi2206/MedWise-AI.git
    ```
    ```bash
    cd MedWise-AI
    ```

2. Create a virtual environment
    ```bash
    python -m venv venv
    ```
    ```bash
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. Install dependencies
    ```bash
    pip install -r requirements.txt
    ```

4. Run the Flask app
    ```bash
    python app.py
    ```

## ✨ Future Improvements

- Properly enhance the OCR feature to accurately extract medicine names and dosages from various types of handwritten and printed prescriptions
- Improve disease prediction accuracy using machine learning models
- Save user history & generate downloadable health reports


## 🙌 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a PR.


 
