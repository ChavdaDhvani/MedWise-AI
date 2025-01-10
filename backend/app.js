import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { drugExtraction } from './medicine_extractor.js';
import { calculateAprioriConfidence, predDis } from './symptoms.js';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();

// Load CSV files and parse them
let bucketmap = [];
let bucket = [];
let datasetClean = [];

const loadCSV = (relativePath, targetArray) => {
  const absolutePath = path.join(__dirname, relativePath);
  fs.readFile(absolutePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${absolutePath}:`, err);
      return;
    }
    const parsedData = Papa.parse(data, { header: true });
    if (parsedData.errors.length > 0) {
      console.error(`Error parsing ${relativePath}:`, parsedData.errors);
      return;
    }
    targetArray.push(...parsedData.data);
  });
};

// Load the CSV files into memory (updated paths)
loadCSV('./bucketmap.csv', bucketmap); // CSV file located in the root directory
loadCSV('./bucket.csv', bucket); // CSV file located in the root directory
loadCSV('./dataset_clean1.csv', datasetClean); // CSV file located in the root directory

app.use(express.json());

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

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
