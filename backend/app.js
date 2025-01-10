import express from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { drugExtraction } from './medicine_extractor.js';
import { calculateAprioriConfidence, predDis } from './symptoms.js';
import { symptomsData } from './symptomsdata.js';

const app = express();
const upload = multer();

// Define the absolute paths to the CSV files
const bucketmapPath = 'C:\\DE\\MedWise-AI\\backend\\bucketmap.csv';
const bucketPath = 'C:\\DE\\MedWise-AI\\backend\\bucket.csv';
const datasetClean1Path = 'C:\\DE\\MedWise-AI\\backend\\dataset_clean1.csv';

// Load CSV files and parse them
let bucketmap = [];
let bucket = [];
let datasetClean = [];

// Load CSV files into memory
const loadCSV = (filePath, targetArray) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${filePath}:`, err);
      return;
    }
    const parsedData = Papa.parse(data, { header: true, skipEmptyLines: true });
    if (parsedData.errors.length > 0) {
      console.error(`Error parsing ${filePath}:`, parsedData.errors);
      return;
    }
    targetArray.push(...parsedData.data);
  });
};

// Load the CSV files into memory (updated paths)
loadCSV(bucketmapPath, bucketmap);
loadCSV(bucketPath, bucket);
loadCSV(datasetClean1Path, datasetClean);

app.use(express.json());

// Serve static files (like images, stylesheets, and HTML) from the current directory
app.use(express.static('C:\\DE\\MedWise-AI\\backend'));

// Define a route for the root URL ("/") to serve main.html
app.get('/', (req, res) => {
  const filePath = 'C:\\DE\\MedWise-AI\\backend\\main.html';  // Direct path
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Route to handle drug extraction from an image
app.post('/image', upload.single('file'), (req, res) => {
  const img = req.file.buffer;
  drugExtraction(img)
    .then((annotation) => {
      res.json(annotation);
    })
    .catch((err) => {
      console.error('Error in drugExtraction:', err);
      res.status(500).json({ error: err.message });
    });
});

// Route to handle disease prediction based on symptoms
app.post('/disease', (req, res) => {
  const { symptoms } = req.body;
  try {
    const top3Diseases = predDis(symptoms, bucket);
    res.json(top3Diseases);
  } catch (err) {
    console.error('Error in predDis:', err);
    res.status(500).json({ error: err.message });
  }
});

// New route for symptom suggestions
app.get('/symptom-suggestions', (req, res) => {
  const { query } = req.query; // Get query parameter for the symptom input
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const suggestions = symptomsData.filter(symptom =>
    symptom.toLowerCase().includes(query.toLowerCase())
  );

  res.json(suggestions);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
