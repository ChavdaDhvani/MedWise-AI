var symps = [];
var sbox = document.getElementById("sbox");

$(document).ready(function () {
    $("input").typeahead({
        source: symp_list,
        minLength: 2
    });

    if (!localStorage.getItem("key")) {
        introJs().start();
        localStorage.setItem("key", "keyValue");
    }
});

function appendNewSymp(name) {
    console.log(name);
    symps.push(name.replace("-", " "));
    $("#positive").append(' <span class="badge badge-secondary">' + name + '</span> ');
    $('#' + name).remove();
}

function deleteSymp(name) {
    $('#' + name).remove();
}

function appendSymp() {
    var a = $("#symptom").val().trim();
    if (a === "") {
        alert("Please enter a symptom.");
        return;
    }
    symps.push(a);
    $("#tags").append('<span class="badge badge-secondary m-1">' + a + '</span>');
    $("#symptom").val("");
}

// Event listener for "Find Out" button (fetches symptom suggestions)
document.getElementById("find_out").addEventListener("click", function () {
    fetch("/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error:", data.error);
            alert("Failed to load symptoms!");
            return;
        }

        let cardsDiv = document.getElementById("cards");
        cardsDiv.innerHTML = "";  // Clear existing content

        data.symptoms.forEach(symptom => {
            let cardHtml = `
                <div class="card w-75 center text-center shadow p-3 mb-5 bg-white rounded boxy" id="${symptom}">
                    <div class="card-body">
                        <p class="card-title">Do you have/feel?</p>
                        <h5 class="card-text">${symptom}</h5>
                        <a class="btn btn-success" onclick="appendNewSymp('${symptom}');"> YES </a>
                        <a class="btn btn-danger" onclick="appendNewSymp(null);"> NO </a>
                    </div>
                </div>`;
            
            cardsDiv.innerHTML += cardHtml;
        });

    })
    .catch(error => console.error("Error:", error));
});


function showDis(data) {
    $("#cards").empty();
    $("#details").empty();
    $("#details").append('<h1 class="boxy text-white text-center"><b>It is most probably ' + data + '.</b></h1><br/><br/><a href="." class="btn btn-outline-light btn-lg">BACK</a>');
}

// Image upload feature
$("#but_upload").click(function () {
    var fd = new FormData();
    var files = $('#file')[0].files[0];

    if (!files) {
        alert("Please insert an image");
    } else {
        fd.append('file', files);
        $("#details").append('<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>');
        
        $.ajax({
            url: '/image',
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log(response);
                RecieveFunc(response);
            }
        });
    }
});

// Google Calendar Integration
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
    }, function (error) {
        console.error(JSON.stringify(error, null, 2));
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

function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function listUpcomingEvents() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then(function (response) {
        var events = response.result.items;
        appendPre('Upcoming events:');

        if (events.length > 0) {
            for (var i = 0; i < events.length; i++) {
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
