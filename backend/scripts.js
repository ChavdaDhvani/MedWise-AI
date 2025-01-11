// Array to store confirmed symptoms
var symps = [];
var sbox = document.getElementById("sbox");

// Initialize arrays to store CSV data
let bucketmap = [];
let bucket = [];
let diseases = [];

// Load CSV files from the correct path
$.get('/bucketmap.csv', function(data) {
    let rows = data.split('\n');
    rows.forEach(function(row) {
        bucketmap.push(row.split(','));
    });
    console.log('bucketmap.csv loaded');
});

$.get('/bucket.csv', function(data) {
    let rows = data.split('\n');
    rows.forEach(function(row) {
        bucket.push(row.split(','));
    });
    console.log('bucket.csv loaded');
});

$.get('/dataset_clean1.csv', function(data) {
    let rows = data.split('\n');
    rows.forEach(function(row) {
        diseases.push(row.split(','));
    });
    console.log('dataset_clean1.csv loaded');
});

$(document).ready(function(){
    $("input").typeahead({
        source: symp_list,
        minLength: 2
    });

    // Initialize intro.js if not already done
    if(!localStorage.getItem("key")) {
        introJs().start();
        localStorage.setItem("key", "keyValue");
    }

    $('#symptom').on('input', function() {
        const query = $(this).val();
        if (query.length > 0) {
            $.get(`/symptom-suggestions?query=${query}`, function(data) {
                $('#suggestions').empty().show(); // Clear previous suggestions
                if (data.length > 0) {
                    data.forEach(function(suggestion) {
                        $('#suggestions').append(`<a href="#" class="list-group-item list-group-item-action">${suggestion}</a>`);
                    });
                } else {
                    $('#suggestions').append('<div class="list-group-item">No suggestions found</div>');
                }
            });
        } else {
            $('#suggestions').hide(); // Hide suggestions if input is empty
        }
    });

    $('#suggestions').on('click', 'a', function() {
        $('#symptom').val($(this).text());
        $('#suggestions').hide();
    });
});

// Function to dynamically add symptom cards
function addSymptomCard(symptom) {
    const cardHtml = 
        `<div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy" id="${symptom}">
          <div class="card-body">
            <p class="card-title">Do you have/feel ?</p>
            <h5 class="card-text">${symptom}</h5>
            <a class="btn btn-success" onclick="addSymptomToSearch('${symptom}');"> YES </a>
            <a class="btn btn-danger" onclick="removeSymptomCard('${symptom}');"> NO </a>
          </div>
        </div>`;
    $('#cards').append(cardHtml);
}

// Function to append selected symptoms to the search section
function addSymptomToSearch(symptom) {
    const symptomHtml = 
        `<div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy" id="search-${symptom}">
          <div class="card-body">
            <p class="card-title">Selected Symptom</p>
            <h5 class="card-text">${symptom}</h5>
            <button class="btn btn-outline-secondary" onclick="appendSymp();" type="button">Add</button>
            <a class="btn btn-danger" onclick="removeSymptomFromSearch('${symptom}');">Remove</a>
          </div>
        </div>`;
    $('#positive').append(symptomHtml);
    $(`#${symptom}`).remove();
}

// Function to remove symptom card when NO is clicked
function removeSymptomCard(symptom) {
    $(`#${symptom}`).remove();
}

// Function to remove symptom from the search section
function removeSymptomFromSearch(symptom) {
    $(`#search-${symptom}`).remove();
}

// Function to show more symptoms after clicking "Find Out"
function showMoreSymptoms() {
    // Fetch the dataset_clean1.csv file
    $.ajax({
        url: '/dataset_clean1.csv', // Ensure this path points to your CSV file
        dataType: 'text',
        success: function(data) {
            const symptomsMap = processCSV(data); // Process the CSV to extract disease-symptom mapping

            // Get the currently selected symptoms
            const selectedSymptoms = $('#positive span').map(function() {
                return $(this).text().trim();
            }).get();

            // Find diseases related to the selected symptoms
            const relatedDiseases = findRelatedDiseases(symptomsMap, selectedSymptoms);

            // Fetch additional symptoms for the related diseases
            const additionalSymptoms = new Set();
            relatedDiseases.forEach(disease => {
                symptomsMap[disease].forEach(symptom => {
                    if (!selectedSymptoms.includes(symptom)) {
                        additionalSymptoms.add(symptom);
                    }
                });
            });

            // Display the additional symptoms as suggestions
            displaySimilarSymptoms(additionalSymptoms);
        },
        error: function() {
            console.error('Error fetching the dataset_clean1.csv file');
        }
    });
}

// Function to display the similar symptoms dynamically
function displaySimilarSymptoms(symptoms) {
    const suggestionsDiv = $('#similar-symptoms');
    suggestionsDiv.empty(); // Clear any previous suggestions

    if (symptoms.size === 0) {
        suggestionsDiv.append('<div>No similar symptoms found.</div>');
    } else {
        symptoms.forEach(symptom => {
            suggestionsDiv.append(`<div class="list-group-item list-group-item-action">${symptom}</div>`);
        });
    }
}

// Function to process the CSV file and create a disease-symptom mapping
function processCSV(data) {
    const rows = data.split('\n');
    const symptomsMap = {};

    rows.forEach(row => {
        const columns = row.split(',');
        if (columns.length < 3) return; // Skip invalid rows

        const disease = columns[0]?.trim(); // First column is the disease
        const symptom = columns[1]?.trim(); // Second column is the symptom

        if (disease && symptom) {
            if (!symptomsMap[disease]) {
                symptomsMap[disease] = [];
            }
            symptomsMap[disease].push(symptom);
        }
    });

    return symptomsMap;
}

// Function to find related diseases based on selected symptoms
function findRelatedDiseases(symptomsMap, selectedSymptoms) {
    const relatedDiseases = [];

    for (const [disease, symptoms] of Object.entries(symptomsMap)) {
        // Check if any selected symptom matches the symptoms of the disease
        if (selectedSymptoms.some(symptom => symptoms.includes(symptom))) {
            relatedDiseases.push(disease);
        }
    }

    return relatedDiseases;
}
