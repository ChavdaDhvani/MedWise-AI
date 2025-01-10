// symptoms.js

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

function calculateAprioriConfidence(X, Y, buckets) {
    let occr_X = 0;
    let occr_Y = 0;

    buckets.forEach((bucket) => {
      if (Array.isArray(X)) {
        if (X.every((val) => bucket.includes(val))) {
          occr_X++;
        }
      } else {
        if (bucket.includes(X)) {
          occr_X++;
        }
      }

      if (Array.isArray(Y)) {
        if (Y.every((val) => bucket.includes(val))) {
          occr_Y++;
        }
      } else {
        if (bucket.includes(Y)) {
          occr_Y++;
        }
      }
    });

    if (occr_X === 0) {
      return 0;
    }
    return (occr_Y / occr_X) * 100;
}

function predDis(symptomList, buckets) {
    let diseaseScore = {};
    let diseaseBucket = {};
    let sure = 0;
    let top3 = [];

    buckets.forEach((bucket) => {
      let bucketLen = bucket.length;
      let score = symptomList.filter((symptom) => bucket.includes(symptom)).length;
      let intersectionLen = score;
      let scorePercentage = (score / symptomList.length) * 100;
      let score1 = (intersectionLen / bucketLen) * 100;

      if (scorePercentage === 100 && score1 === 100) {
        sure = 1;
        let disease = getDiseaseGivenBucket(bucket);
        console.log(`It is most likely ${disease}`);
        return;
      }

      if (scorePercentage > 0) {
        let disease = getDiseaseGivenBucket(bucket);
        diseaseScore[disease] = scorePercentage;
        diseaseBucket[disease] = bucket;
      }
    });

    top3 = Object.entries(diseaseScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return top3;
}

function getDiseaseGivenBucket(bucket) {
    // Placeholder for actual disease determination logic
    return 'DiseaseName';  // Return a default disease name for now
}

module.exports = { calculateAprioriConfidence, predDis };
