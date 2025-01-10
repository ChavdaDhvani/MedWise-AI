var symps = [];
var sbox = document.getElementById("sbox");

$(document).ready(function(){
    $("input").typeahead({
        source: symp_list,
        minLength: 2
    });

    // Initialize intro.js if not already done
    if(!localStorage.getItem("key")) {
        introJs().start();
        localStorage.setItem("key", "keyValue");
    };
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
        $("#cards").append('<div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy" id="'+name+'"><div class="card-body"><p class="card-title">Your symptoms</p><h5 class="card-text" id="positive"></h5></div><button type="button" onclick=sendSymp(); class="btn btn-warning btn-lg">SEARCH</button></div>');
    }
}

function showDis(data){
    $("#cards").empty();
    $("#details").empty();
    $("#details").append('<h1 class="boxy text-white" style="text-align: center; text-shadow: 0 0 20px #000000;"><b>It is most probably '+ data +' .</b></h1><br/><br/><a role="button" aria-pressed="true" href="." class="btn btn-outline-light btn-lg">BACK</a>');
}

function RecieveFunc(data){
    $("#cards").empty();
    $("#details").empty();
    $("#slogan").empty();
    sbox.classList.toggle("m-fadeOut");
    if(data.length === 0){
        $("#cards").append('<div class="card text-center shadow rounded w-75 center"><div class="card-body"><h5 class="card-title">No results found!</h5></div></div><br/><br/><a role="button" aria-pressed="true" href="." class="btn btn-outline-light btn-lg">BACK</a>');
    } else {
        $("#details").append('<h3 class="text-white" style="text-align: center; text-shadow: 0 0 20px #000000;"><b>Here is your schedule </b></h3><br/><br/><a role="button" aria-pressed="true" href="." class="btn btn-outline-light btn-small">BACK</a>');
        var count = Object.keys(data).length;
        console.log(count);

        var i = 1;
        // Assuming you want to display the medicines
        $("#cards").append('<div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy"> <div class="card-body"> <h5 class="card-title">Medicine</h5> <p class="card-text">Take Aspirin for 7 days.</p> <a class="btn btn-outline-success">Done</a> </div> </div>');
        $("#cards").append('<div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy"> <div class="card-body"> <h5 class="card-title">Medicine</h5> <p class="card-text">Take Advil for 3 days.</p> <a class="btn btn-outline-success">Done</a> </div> </div>');
        $("#cards").append('<div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy" id="'+name+'"><div class="card-body"><h3 class="card-title">Synchronize with Google?</h3><h5 class="card-text" id="positive"><button type="button" onclick=sendSymp(); class="btn btn-warning">Add to Google Calendar</button></h5></div></div>');
    }
}

// Google Calendar API code
var CLIENT_ID = '686668170446-90dc678t33eiobahgan5qte8aod8nq1a.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBs9ZaCKkEMP7AdJWzDylVKFw_zJ7UzPHE';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function(error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        listUpcomingEvents();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function listUpcomingEvents() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then(function(response) {
        var events = response.result.items;
        appendPre('Upcoming events:');
        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                appendPre(event.summary + ' (' + when + ')');
            }
        } else {
            appendPre('No upcoming events found.');
        }
    });
}

function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}
