import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { drugExtraction } from './medicine_extractor.js';
import { predDis } from './symptoms.js';

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



// Load the CSV files into memory
loadCSV('./bucketmap.csv', bucketmap);
loadCSV('./bucket.csv', bucket);
loadCSV('./dataset_clean1.csv', datasetClean);


app.use(express.json());

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
