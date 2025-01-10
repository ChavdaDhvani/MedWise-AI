const { JSDOM } = require("jsdom");
const fs = require('fs');
const axios = require('axios');
const express = require('express');
const path = require('path');

// Create a new Express app instance
const app = express();

// Serve static files from the 'static' directory
app.use(express.static(path.join(__dirname, 'static')));

// Create a new JSDOM instance for simulating the DOM
const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body><input type="text" class="form-control" id="symptom" placeholder="Symptoms" autocomplete="off"></body></html>`);
const document = dom.window.document;

// Simulate jQuery in Node.js environment
const $ = require('jquery')(dom.window);

// Initialize variables
var symps = [];

// Initialize arrays to store CSV data
let bucketmap = [];
let bucket = [];
let diseases = [];

// Define absolute paths for CSV files
const bucketmapPath = path.join(__dirname, 'bucketmap.csv');
const bucketPath = path.join(__dirname, 'bucket.csv');
const diseasesPath = path.join(__dirname, 'dataset_clean1.csv');

// Load CSV files (using fs for local files)
function loadCSV(filePath, targetArray) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      console.error(`Failed to load ${filePath}`);
      return;
    }
    let rows = data.split('\n');
    rows.forEach(function (row) {
      targetArray.push(row.split(','));
    });
    console.log(`${filePath} loaded`);
  });
}

loadCSV(bucketmapPath, bucketmap);
loadCSV(bucketPath, bucket);
loadCSV(diseasesPath, diseases);

// Append a new symptom
function appendNewSymp(name) {
  const formattedName = name.replace("-", " ");
  symps.push(formattedName);
  $("#positive").append(`<span class="badge badge-secondary">${formattedName}</span>`);
  $(`#${name}`).remove();
}

// Delete a symptom
function deleteSymp(name) {
  $(`#${name}`).remove();
  symps = symps.filter(symptom => symptom !== name.replace("-", " "));
}

// Append symptom from input field
function appendSymp() {
  const symptom = $("#symptom").val();
  if (symptom) {
    symps.push(symptom);
    $("#tags").append(`<span class="badge badge-secondary">${symptom}</span>`);
    $("#symptom").val("");
  }
}

// AJAX call for "Find Disease"
$("#symp_upload").click(function () {
  if (symps.length === 0) {
    alert("Please add symptoms!");
    return;
  }

  $.ajax({
    url: '/disease',
    type: 'POST',
    data: JSON.stringify({ symptoms: symps }),
    dataType: 'json',
    contentType: "application/json",
    success: function (response) {
      symps = [];
      SymFunc(response);
      console.log("Disease identification complete!");
    },
    error: function (error) {
      console.error("Error identifying disease:", error);
    },
  });
});

// AJAX call for "Scan Prescription"
$("#but_upload").click(function () {
  const fileInput = $('#file')[0].files[0];
  if (!fileInput) {
    alert("Please insert an image");
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput);

  $("#details").append('<div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"><span class="sr-only">Loading...</span></div>');

  $.ajax({
    url: '/image',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      RecieveFunc(response);
    },
    error: function (error) {
      console.error("Error scanning prescription:", error);
    },
  });
});

// Display symptoms-related cards
function SymFunc(data) {
  $("#cards, #details, #slogan").empty();

  if (data.length === 0) {
    $("#cards").append(`
      <div class="card text-center shadow rounded w-75 center">
        <div class="card-body">
          <h5 class="card-title">No results found!</h5>
        </div>
      </div>
    `);
  } else {
    $("#details").append(`
      <h3 class="text-white" style="text-align: center; text-shadow: 0 0 20px #000000;">
        <b>Please answer the following questions.</b>
      </h3>
      <br/><br/>
      <a role="button" aria-pressed="true" href="." class="btn btn-outline-light btn-small">BACK</a>
    `);

    data.forEach(function (name) {
      const formattedName = name.replace(/\s/g, '-');
      $("#cards").append(`
        <div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy" id="${formattedName}">
          <div class="card-body">
            <p class="card-title">Do you have/feel?</p>
            <h4 class="card-text" style="text-align: center; text-shadow: 0 0 2px #000000;"><b>${name}</b></h4>
            <div class="row">
              <div class="col-md-2"></div>
              <a class="btn btn-outline-success col-md-3" onclick="appendNewSymp('${formattedName}');"><b> YES </b></a>
              <div class="col-md-2"></div>
              <a class="btn btn-outline-danger col-md-3" onclick="deleteSymp('${formattedName}');"><b> NO </b></a>
              <div class="col-md-2"></div>
            </div>
          </div>
        </div>
      `);
    });
  }
}

// Handle prescription results
function RecieveFunc(data) {
  $("#details, #cards, #slogan").empty();

  if (data.entities.length === 0) {
    $("#cards").append(`
      <div class="card text-center shadow rounded w-75 center">
        <div class="card-body">
          <h5 class="card-title">No results found!</h5>
        </div>
      </div>
    `);
  } else {
    data.entities.forEach(function (name) {
      $("#cards").append(`
        <div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy">
          <div class="card-body">
            <p class="card-title">Does it look like this?</p>
            <h4 class="card-text" style="text-align: center; text-shadow: 0 0 2px #000000;"><b>${name}</b></h4>
            <div class="row">
              <div class="col-md-2"></div>
              <a class="btn btn-outline-success col-md-3" onclick="appendNewSymp('${name}');"><b> YES </b></a>
              <div class="col-md-2"></div>
              <a class="btn btn-outline-danger col-md-3" onclick="deleteSymp('${name}');"><b> NO </b></a>
              <div class="col-md-2"></div>
            </div>
          </div>
        </div>
      `);
    });
  }
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
