//pseudo code this out for train activities homework

//When the user clicks on submit, take the data in the lower box, store it in the database
// Use the updated data base to re-populate the train list (make that a function)

// That function should do the math to determine minutes until arrival, etc.
// Only store in the db stuff that is NOT calculated.
// make sure that the only thing to be displayed is the header, if nothing exists in the db

// Make an interval timer (1 sec?  5 sec?  1 minute, most likely) that goes off and recalculates and repopulates the upper screen...ie calls the function
// I believe the challenge to do this means to make me update ONLY the fields changing, rather than redraw the entire schedule.  That would be
// significantly challenging...

// fields to display in schedule window:
// Train Name,  Destination,  Frequency (min),  Next Arrival  (in format HH:MM AM/PM), and Minutes Away
//

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAoQAiTxvAH8lHQE6Tov5DJQUIFJVnDQtM",
    authDomain: "matt-push-proj.firebaseapp.com",
    databaseURL: "https://matt-push-proj.firebaseio.com",
    projectId: "matt-push-proj",
    storageBucket: "matt-push-proj.appspot.com",
    messagingSenderId: "596996272748"

};

firebase.initializeApp(config);

var database = firebase.database();

// Initial Values
var dataSet = {
    name: "",
    dest: "",
    stTime: "",
    freq: 0,
    nextArr: "",
    minAway: 0
};

var clearDataSet = function(data) {
    data.name = "";
    data.dest = "";
    data.stTime = "";
    data.freq = 0;
    data.nextArr = "";
    data.minAway = 0;
    return data;
}

var createRow = function(data) {
    // Create a new table row element
    var tRow = $("<tr>");
    // Methods run on jQuery selectors return the selector they we run on
    // This is why we can create and save a reference to a td in the same statement we update its text
    var trainName = $("<td>").text(data.name);
    var destination = $("<td>").text(data.dest);
    var frequency = $("<td>").text(data.freq);
    var nextArrival = $("<td>").text(moment(data.nextArr).format("HH:mm"));
    var minutesAway = $("<td>").text(data.minAway);

    // Append the newly created table data to the table row
    tRow.append(trainName, destination, frequency, nextArrival, minutesAway);
    // Append the table row to the table body
    $("tbody").append(tRow);
};



var calculateTimes = function(data) {
    // This function takes the input object, data, and uses the values in it
    // to calculate the remainder of time until the next train arrival, and 
    // the time that it will arrive.  It places those calculated values back into
    // the data object.

    // First Time (pushed back 1 year to make sure it comes before current time)
    var timeBuff = data.stTime;
    var firstTimeConverted = moment(timeBuff, "HH:mm").subtract(1, "years");
    console.log(firstTimeConverted);
    console.log("STATUS of data.stTime: " + data.stTime);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % data.freq;
    console.log(tRemainder);

    // Minute Until Train
    //var tMinutesTillTrain = tFrequency - tRemainder;
    data.minAway = data.freq - tRemainder;
    console.log("MINUTES TILL TRAIN: " + data.minAway);

    // Next Train
    //var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    data.nextArr = moment().add(data.minAway, "minutes");
    console.log("ARRIVAL TIME: " + moment(data.nextArr).format("hh:mm"));

    return data;
}




// Capture Button Click
$("#add-train-sched").on("click", function(event) {
    // When the user clicks on the Submit button,
    // Place the data input into the dataSet object,
    // Use those values to calculate the time display 
    // values, use the dataSet object to store the 
    // necessary info in the database, and then 
    // create + display the row created from the
    // dataSet object.

    event.preventDefault();

    // Maybe not needed
    dataSet = clearDataSet(dataSet);

    // Grab the values from text boxes
    dataSet.name = $("#trainName").val().trim();
    dataSet.dest = $("#destination").val().trim();
    dataSet.stTime = $("#startTime").val().trim();
    dataSet.freq = $("#trainFrequency").val().trim();

    dataSet = calculateTimes(dataSet);

    // Push the non-calculated values to the database
    database.ref().push({
        name: dataSet.name,
        dest: dataSet.dest,
        start: dataSet.stTime,
        freq: dataSet.freq,
    });

    //  Add the row to the upper table
    createRow(dataSet);

});

// When all is done, and the row gets added to the db,
// we can clear out the user input fields.
database.ref().on("child_added", function(snapshot) {
    // storing the snapshot.val() in a variable for convenience
    var sv = snapshot.val();

    // Console.loging the last user's data
    console.log(sv.name);
    console.log(sv.dest);
    console.log(sv.stTime);
    console.log(sv.freq);

    // Clear out the text fields, now that the db stuff has worked.
    $("#trainName").text("");
    $("#destination").text("");
    $("#startTime").text("");
    $("#trainFrequency").text("");

    // Handle the errors
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// This is intended to be the initial load
// When a user fires up this product, populate the screen
// with the info gathered from the db.
database.ref().orderByChild("dateAdded").once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        // Create a row for this db entry, and sling it onto the html
        csv = childSnapshot.val();
        dataSet.name = csv.name;
        dataSet.dest = csv.dest;
        dataSet.stTime = csv.start;
        dataSet.freq = csv.freq;

        dataSet = calculateTimes(dataSet);

        createRow(dataSet);
    });
});