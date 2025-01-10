import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

// Define the absolute paths to the CSV files
const bucketmapPath = 'C:\\DE\\MedWise-AI\\backend\\bucketmap.csv';
const bucketPath = 'C:\\DE\\MedWise-AI\\backend\\bucket.csv';
const datasetClean1Path = 'C:\\DE\\MedWise-AI\\backend\\dataset_clean1.csv';

// Log the paths to ensure they're correct
console.log('bucketmapPath:', bucketmapPath);
console.log('bucketPath:', bucketPath);
console.log('datasetClean1Path:', datasetClean1Path);

// Load CSV files with error handling
async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        console.log(`${path.basename(filePath)} loaded`);
        resolve(data);
      })
      .on('error', (err) => {
        console.error(`Error reading ${filePath}:`, err);
        reject(err);
      });
  });
}

// Load CSV files asynchronously
let bucketmap = [];
let bucket = [];
let diseases = [];

async function loadData() {
  try {
    bucketmap = await loadCSV(bucketmapPath);
    bucket = await loadCSV(bucketPath);
    diseases = await loadCSV(datasetClean1Path);
  } catch (err) {
    console.error('Error loading CSV files:', err);
  }
}

// Call the loadData function to load all CSVs at once
await loadData();

// Apriori confidence calculation
function calculateAprioriConfidence(X, Y, buckets) {
  let occr_X = 0;
  let occr_Y = 0;

  buckets.forEach((bucket) => {
    if (Array.isArray(X) ? X.every((val) => bucket.includes(val)) : bucket.includes(X)) {
      occr_X++;
    }
    if (Array.isArray(Y) ? Y.every((val) => bucket.includes(val)) : bucket.includes(Y)) {
      occr_Y++;
    }
  });

  return occr_X === 0 ? 0 : (occr_Y / occr_X) * 100;
}

// Predict disease based on symptoms
function predDis(symptomList, buckets) {
  const diseaseScore = {};
  let top3 = [];

  buckets.forEach((bucket) => {
    const bucketLen = bucket.length;
    const score = symptomList.filter((symptom) => bucket.includes(symptom)).length;
    const scorePercentage = (score / symptomList.length) * 100;
    const score1 = (score / bucketLen) * 100;

    if (scorePercentage === 100 && score1 === 100) {
      const disease = getDiseaseGivenBucket(bucket);
      console.log(`It is most likely ${disease}`);
      return;
    }

    if (scorePercentage > 0) {
      const disease = getDiseaseGivenBucket(bucket);
      diseaseScore[disease] = scorePercentage;
    }
  });

  // Sort diseases by score and return top 3
  top3 = Object.entries(diseaseScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return top3;
}

// Get disease name from bucket (Placeholder logic)
function getDiseaseGivenBucket(bucket) {
  // You can replace this logic with actual disease determination
  return 'DiseaseName'; // Return a default disease name for now
}

export { calculateAprioriConfidence, predDis };
