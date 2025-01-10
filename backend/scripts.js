var symps = [];  // Array to store confirmed symptoms
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
});

// Function to append new symptom to the list
function appendNewSymp(name){
    console.log(name);
    symps.push(name.replace("-", " "));  // Add confirmed symptom to the list
    $("#positive").append(' <span class="badge badge-secondary">'+ name +'</span> ');
    $('#'+name).remove();  // Remove the card after confirmation
}

// Function to delete symptom card
function deleteSymp(name){
    $('#'+name).remove();  // Remove the card if "No" is clicked
}

// Function to append symptom to the UI
function appendSymp(){
    var a = $("#symptom").val();
    symps.push(a);  // Add the symptom to the list
    $("#tags").append('<span> </span><span class="badge badge-secondary">'+a+'</span>');
    $("#symptom").val("");  // Clear the input field
}

// Function to upload symptoms and get disease prediction
$("#symp_upload").click(function(){
    $.ajax({
        url: '/disease',
        type: 'POST',
        data: JSON.stringify({
            'symptoms': symps  // Send the confirmed symptoms to the backend
        }),
        dataType: 'json',
        contentType: "application/json",
        success: function(response){
            console.log(response);
            symps = [];  // Clear the symptoms list after submission
            SymFunc(response);  // Handle the disease suggestions
            console.log("DONE!");
        },
        error: function(error){
            console.log("Error: ", error);
        }
    });
});

// Function to send symptoms and get disease suggestions
function sendSymp(){
    $.ajax({
        url: '/find',
        type: 'POST',
        data: JSON.stringify({
            'symptoms': symps  // Send the symptoms to the backend
        }),
        dataType: 'text',
        contentType: "application/json",
        success: function(response){
            console.log(response);
            symps = [];  // Clear the symptoms list after submission
            showDis(response);  // Show the disease suggestions
            console.log("DONE!");
        },
        error: function(error){
            console.log("Error: ", error);
        }
    });
}

// Function to handle disease prediction results
function SymFunc(data){
    $("#cards").empty();
    $("#details").empty();
    $("#slogan").empty();
    sbox.classList.toggle("m-fadeOut");
    if(data.length === 0){
        $("#cards").append('<div class="card text-center shadow rounded w-75 center"><div class="card-body"><h5 class="card-title">No results found!</h5></div></div>');
    } else {
        $("#details").append('<h3 class="text-white" style="text-align: center; text-shadow: 0 0 20px #000000;"><b>Please answer the following questions.</b></h3><br/><br/><a role="button" aria-pressed="true" href="." class="btn btn-outline-light btn-small">BACK</a>');
        data.forEach(function(name){
            var name = name.replace(/\s/g, '-');
            $("#cards").append(' <div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy" id="'+name+'"> <div class="card-body"> <p class="card-title">Do you have/feel ?</p> <h4 class="card-text" style="text-align: center; text-shadow: 0 0 2px #000000;"><b>'+name+'</b></h4> <div class="row"> <div class="col-md-2"></div> <a class="btn btn-outline-success col-md-3 " onclick=appendNewSymp("'+ name +'");><b> YES </b></a> <div class="col-md-2"></div> <a class="btn btn-outline-danger col-md-3" onclick=deleteSymp("'+ name +'");><b> NO </b></a> <div class="col-md-2"></div> </div> </div> </div>');
        });
    }
}

// Function to handle received data from image extraction
function RecieveFunc(data){
    $("#details").empty();
    $("#cards").empty();
    $("#slogan").empty();
    if(data.entities.length === 0){
        $("#cards").append('<div class="card text-center shadow rounded w-75 center"><div class="card-body"><h5 class="card-title">No results found!</h5></div></div>');
    } else {
        data.entities.forEach(function(name){
            $("#cards").append(' <div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy"> <div class="card-body"> <p class="card-title">Does it look like this?</p> <h4 class="card-text" style="text-align: center; text-shadow: 0 0 2px #000000;"><b>'+name+'</b></h4> <div class="row"> <div class="col-md-2"></div> <a class="btn btn-outline-success col-md-3 " onclick=appendNewSymp("'+ name +'");><b> YES </b></a> <div class="col-md-2"></div> <a class="btn btn-outline-danger col-md-3" onclick=deleteSymp("'+ name +'");><b> NO </b></a> <div class="col-md-2"></div> </div> </div> </div>');
        });
    }
}
