const express = require('express');
const multer = require('multer');
const { drugExtraction } = require('./medicine_extractor');
const { predDis } = require('./symptoms');
const fs = require('fs');
import Papa from 'papaparse';

const app = express();
const upload = multer();

// Load CSV files and parse them
let bucketmap = [];
let bucket = [];
let datasetClean = [];

const loadCSV = (path, targetArray) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${path}:`, err);
      return;
    }
    const parsedData = Papa.parse(data, { header: true });
    targetArray.push(...parsedData.data);
  });
};

// Load the CSV files into memory
loadCSV('/bucketmap.csv', bucketmap);
loadCSV('/bucket.csv', bucket);
loadCSV('/dataset_clean1.csv', datasetClean);

app.use(express.json());

app.post('/image', upload.single('file'), (req, res) => {
  const img = req.file.buffer;
  drugExtraction(img)
    .then((annotation) => {
      res.json(annotation);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.post('/disease', (req, res) => {
  const { symptoms } = req.body;
  const top3Diseases = predDis(symptoms, bucket);
  res.json(top3Diseases);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

