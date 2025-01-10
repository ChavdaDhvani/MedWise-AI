// medicine_extractor.js

const Tesseract = require('tesseract.js');
const fs = require('fs');
const csv = require('csv-parser');

// Load CSV files
let bucketmap = [];
let bucket = [];
let diseases = [];

fs.createReadStream('/bucketmap.csv')
  .pipe(csv())
  .on('data', (row) => {
    bucketmap.push(row);
  })
  .on('end', () => {
    console.log('bucketmap.csv loaded');
  });

fs.createReadStream('/bucket.csv')
  .pipe(csv())
  .on('data', (row) => {
    bucket.push(row);
  })
  .on('end', () => {
    console.log('bucket.csv loaded');
  });

fs.createReadStream('/dataset_clean1.csv')
  .pipe(csv())
  .on('data', (row) => {
    diseases.push(row);
  })
  .on('end', () => {
    console.log('dataset_clean1.csv loaded');
  });

function drugExtraction(imageFile) {
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

module.exports = { drugExtraction };

