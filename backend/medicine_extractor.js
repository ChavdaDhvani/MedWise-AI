import Tesseract from 'tesseract.js';
import fs from 'fs';
import csv from 'csv-parser';

// Load CSV files
let bucketmap = [];
let bucket = [];
let diseases = [];

// Adjusted paths for the CSV files
fs.createReadStream('bucketmap.csv')
  .pipe(csv())
  .on('data', (row) => {
    bucketmap.push(row);
  })
  .on('end', () => {
    console.log('bucketmap.csv loaded');
  });

fs.createReadStream('bucket.csv')
  .pipe(csv())
  .on('data', (row) => {
    bucket.push(row);
  })
  .on('end', () => {
    console.log('bucket.csv loaded');
  });

fs.createReadStream('dataset_clean1.csv')
  .pipe(csv())
  .on('data', (row) => {
    diseases.push(row);
  })
  .on('end', () => {
    console.log('dataset_clean1.csv loaded');
  });

export function drugExtraction(imageFile) {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: (m) => console.log(m),
      }
    )
      .then(({ data: { text } }) => {
        const annotations = extractDrugInformation(text);
        resolve(annotations);
      })
      .catch((error) => reject(error));
  });
}

function extractDrugInformation(text) {
  // Placeholder for extracting drug information
  return {
    text: text,
    entities: [], // Add logic for extracting drug names, dosages, etc.
    bucketmap: bucketmap,
    bucket: bucket,
    diseases: diseases,
  };
}
