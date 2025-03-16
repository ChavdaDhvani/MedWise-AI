import easyocr
import numpy as np
import json
import spacy

# Load the spaCy model for general NER
nlp = spacy.load("en_core_web_sm")

# Load drug dictionary
with open('drugs.json', 'r', encoding="utf-8") as f:
    drugs_dict = json.load(f)

def text_from_image(img):
    img_data = np.frombuffer(img.read(), dtype=np.uint8)  # Read image data as numpy array
    reader = easyocr.Reader(['en'])  # Initialize EasyOCR reader
    result = reader.readtext(img_data)  # Perform OCR on the image

    all_text = [text for (_, text, _) in result]
    return all_text

def drug_extraction(img):
    all_text_as_list = text_from_image(img)  # Get text from image
    all_text = " ".join(all_text_as_list)  # Combine text into a single string

    # Use spaCy's NLP model to process the text and extract entities
    doc = nlp(all_text)
    drug_entities = [ent.text for ent in doc.ents if ent.label_ == "PRODUCT" and ent.text.lower() in drugs_dict["drugs"]]
    
    print("Extracted Drug Entities:", drug_entities)
    return drug_entities

if __name__ == "__main__":
    img = open('path_to_your_image.jpg', 'rb')  # Update the path to your image
    drug_extraction(img)
