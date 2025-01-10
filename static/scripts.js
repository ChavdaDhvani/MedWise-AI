// script.js

var symps = [];
var sbox = document.getElementById("sbox");

// Initialize arrays to store CSV data
let bucketmap = [];
let bucket = [];
let diseases = [];

// Load CSV files
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

function appendNewSymp(name){
    console.log(name);
    symps.push(name.replace("-", " "));
    $("#positive").append(' <span class="badge badge-secondary">'+ name +'</span> ');
    $('#'+name).remove();
}

function deleteSymp(name){
    $('#'+name).remove();
}

function appendSymp(){
    var a = $("#symptom").val();
    symps.push(a);
    $("#tags").append('<span> </span><span class="badge badge-secondary">'+a+'</span>');
    $("#symptom").val("");
}

$("#symp_upload").click(function(){
    $.ajax({
        url: '/disease',
        type: 'POST',
        data: JSON.stringify({
            'symptoms': symps
        }),
        dataType: 'json',
        contentType: "application/json",
        success: function(response){
            console.log(response);
            symps = [];
            SymFunc(response);
            console.log("DONE!");
        },
        error: function(error){
            console.log("Error: ", error);
        }
    });
});

function sendSymp(){
    $.ajax({
        url: '/find',
        type: 'POST',
        data: JSON.stringify({
            'symptoms': symps
        }),
        dataType: 'text',
        contentType: "application/json",
        success: function(response){
            console.log(response);
            symps = [];
            showDis(response);
            console.log("DONE!");
        },
        error: function(error){
            console.log("Error: ", error);
        }
    });
}

$("#but_upload").click(function(){
    var fd = new FormData();
    var files = $('#file')[0].files[0];
    if(files == undefined ){
        alert("Please insert an image");
    } else {
        fd.append('file', files);
        $("#details").append('<div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"> <span class="sr-only">Loading...</span></div>');
        $.ajax({
            url: '/image',
            type: 'POST',
            data: fd,
            contentType: false,
            processData: false,
            success: function(response){
                console.log(response);
                RecieveFunc(response);
            },
            error: function(error){
                console.log("Error: ", error);
            }
        });
    }
});

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
