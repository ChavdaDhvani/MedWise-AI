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
const loadCSV = (relativePath, targetArray) => {
  const absolutePath = path.join(__dirname, relativePath);
  fs.readFile(absolutePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${absolutePath}:`, err);
      return;
    }
    const parsedData = Papa.parse(data, { header: true });
    targetArray.push(...parsedData.data);
  });
};

// Load the bucketmap and bucket CSV files (updated paths)
loadCSV('bucketmap.csv', bucketmap); // CSV file located in the root directory
loadCSV('bucket.csv', buckets); // CSV file located in the root directory

// Read and process dataset_clean1.csv (updated path)
fs.createReadStream('dataset_clean1.csv') // CSV file located in the root directory
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
