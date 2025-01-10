const fs = require('fs');
const csv = require('csv-parser');
import Papa from 'papaparse';

let diseases = [];
let buckets = [];
let bucketmap = [];
let bucket = [];
let lastDisease = "";
let switchFlag = true;

// Load CSV files and parse them
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

// Load the bucketmap and bucket CSV files
loadCSV('bucketmap.csv', bucketmap);
loadCSV('/bucket.csv', buckets);

// Read and process dataset_clean1.csv
fs.createReadStream('/dataset_clean1.csv')
  .pipe(csv())
  .on('data', (row) => {
    let disease = row[0];
    if (disease !== lastDisease || switchFlag) {
      lastDisease = disease;

      if (!switchFlag) {
        buckets.push(bucket);
      }

      console.log(bucket);
      bucket = [];
      bucket.push(row[1]);
      switchFlag = false;
    } else {
      bucket.push(row[1]);
    }
  })
  .on('end', () => {
    fs.writeFileSync('buckets.json', JSON.stringify(buckets));
  });

