//===============================================================
//===============================================================
// VARIABLE INITIALIZATION + Firebase/Myo Config
//===============================================================
//===============================================================
var orientStreamx = [];
var orientStreamy = [];
var orientStreamz = [];
var orientStreamw = [];
var gyroStreamx = [];
var gyroStreamy = [];
var gyroStreamz = [];
var accelStreamx = [];
var accelStreamy = [];
var accelStreamz = [];
var podstream0 = [];
var podstream1 = [];
var podstream2 = [];
var podstream3 = [];
var podstream4 = [];
var podstream5 = [];
var podstream6 = [];
var podstream7 = [];
var username = $(location).attr('href');
if (username.indexOf("?") < 0)
    username = prompt("Username", "duttaoindril");
else
    username = username.substring(username.indexOf("?")+1);
var myoSport = new Firebase("https://myosport.firebaseio.com/"+username);
console.log("Logged into user account of", username);

var keys = [];
var connected = false;
var recording = false;
var drawing = false;
var timestamp = 0;
var name = "";
var color = "";
var arm = "";
var direction = "";
var orientationoffset = {};

//===============================================================
//===============================================================
// FIREBASE INITIALIZATION
//===============================================================
//===============================================================
myoSport.child("recordings").on('value', function(snapshot) {
    $("#name").html("");
    $("#time").html("");
    $("#arm").html("");
    $("#color").html("");
    $("#dtw").html("");
    $("#dtwA").html("");
    $("#dtwB").html("");
    document.getElementById("visualxy").getContext("2d").clearRect(0, 0, 400, 400);
    document.getElementById("visualxz").getContext("2d").clearRect(0, 0, 400, 400);
    document.getElementById("visualyz").getContext("2d").clearRect(0, 0, 400, 400);
    for (key in snapshot.val()) {
        keys.push(key);
    }
});
myoSport.child("connected").on('value', function(snapshot) {
    connected = snapshot.val();
});
myoSport.child("recording").on('value', function(snapshot) {
    recording = snapshot.val();
});
myoSport.child("details").on('value', function(snapshot) {
    data = snapshot.val();
    name = data.myoname;
    color = data.myocolor;
    arm = data.myoarm;
    direction = data.myodirection;
    orientationoffset = data.myoorientationoffset;
});
myoSport.child("recordings").on("value", function(snapshot) {
    var recordings = snapshot.val();
    var i = 0;
    for (key in recordings) {
        var r = recordings[key];
        $("#name").html($("#name").html() + "<td>" + r["name"] + "</td>");
        $("#time").html($("#time").html() + "<td>" + r["time"] + "</td>");
        $("#arm").html($("#arm").html() + "<td>" + r["arm"] + "</td>");
        $("#color").html($("#color").html() + "<td>" + r["color"] + "</td>");
        $("#dtw").append($("<option></option>").attr("value", key).text(r["name"]));
        $("#dtwA").append($("<option></option>").attr("value", key).text(r["name"]));
        $("#dtwB").append($("<option></option>").attr("value", key).text(r["name"]));
        $("#graphselect").append($("<option></option>").attr("value", key).text(r["name"]));
        draw(r['accelStreamx'], r['accelStreamy'], "xy", -1, 10, r["color"], 3);
        draw(r['accelStreamx'], r['accelStreamz'], "xz", -1, 10, r["color"], 3);
        draw(r['accelStreamy'], r['accelStreamz'], "yz", -1, 10, r["color"], 3);
        if(i == 0)
            draw3D(r['accelStreamx'], r['accelStreamy'], r['accelStreamz'], "xyz", -1, 10, r["color"], 3);
        i++;
    }
});

//===============================================================
//===============================================================
// MYO INITIALIZATION
//===============================================================
//===============================================================
Myo.onError = function() {
    console.log("Error connecting Myo. Try refreshing the page and/or restarting Myo Connect.\n");
}
// Attempt to connect to myo
Myo.connect();
// On connect event handler; vibrate once and set myo configs and push connected as true to firebase
Myo.on('connected', function(data, timestamp) {
    this.streamEMG(true);
    myoSport.child("connected").set(true);
    $("#status").html("Myo Connected");
    this.vibrate("short");
    console.log("Myo Connected Successfully!");
});
// On arm synced event handler; vibrate twice and send arm, direction, and offset to firebase
Myo.on('arm_synced', function() {
    this.vibrate("short");
    this.vibrate("short");
    myoSport.child("details/myoarm").set(this.arm);
    myoSport.child("details/myodirection").set(this.direction);
    myoSport.child("details/myoorientationoffset").set(this.orientationOffset);
    console.log("Myo Synced Successfully!");
});
// On arm unsynced event handler; vibrate thrice and reset arm, direction, and offset on firebase
Myo.on('arm_unsynced', function() {
    this.vibrate("short");
    this.vibrate("short");
    this.vibrate("short");
    myoSport.child("details/myoarm").set("unknown");
    myoSport.child("details/myodirection").set("unknown");
    myoSport.child("details/myoorientationoffset").set("unknown");
    console.log("Oh no! Myo Unsynced!\n");
});

Myo.on('disconnected', function() {
    stopRec();
    myoSport.child("connected").set(false);
    console.log("Oh no! Myo Disconnected!\n");
    $("#status").html("Myo <b>Not</b> Connected");
});

//===============================================================
//===============================================================
// RECORDING BUTTON ONCLICK INITIALIZATION
//===============================================================
//===============================================================
$("#rec").click(function() {
    Myo.connect();
    if(connected == false || drawing)
        alert("Please connect your Myo, or stop drawing first.");
    else if(!recording)
        record();
    else if (recording)
        stopRec();
});

//===============================================================
//===============================================================
// FREE DRAW BUTTON ONCLICK INITIALIZATION
//===============================================================
//===============================================================
$("#draw").click(function() {
    Myo.connect();
    if(connected == false || recording)
        alert("Please connect your Myo, or stop recording first.");
    else if(!drawing) {
        $("#draw").html("Stop");
        $("#status").html("Myo Free Drawing");
        var xy = [0, 0, 200, 200];
        var xz = [0, 0, 200, 200];
        var yz = [0, 0, 200, 200];
        drawing = true;
        Myo.on('accelerometer', function(data) {
            xy = freedraw("xy", -1, 10, "orange", 3, xy[0], xy[1], xy[2], xy[3], data['x'], data['y']);
            xz = freedraw("xz", -1, 10, "orange", 3, xz[0], xz[1], xz[2], xz[3], data['x'], data['z']);
            yz = freedraw("yz", -1, 10, "orange", 3, yz[0], yz[1], yz[2], yz[3], data['y'], data['z']);
        });
    }
    else if (drawing) {
        drawing = false;
        $("#draw").html("Draw");
        Myo.off("accelerometer");
    }
});

//===============================================================
//===============================================================
// DTW COMPARE BUTTON ONCLICK INITIALIZATION
//===============================================================
//===============================================================
$("#compare").click(function() {
    Myo.connect();
    if(connected == false || drawing)
        alert("Please connect your Myo, or stop drawing first.");
    else if(!recording) {
        var dtwrecording;
        var accelx = [];
        var accely = [];
        var accelz = [];
        var dtwvalx = [];
        var dtwvaly = [];
        var dtwvalz = [];
        var xy = [0, 0, 200, 200];
        var xz = [0, 0, 200, 200];
        var yz = [0, 0, 200, 200];
        var i = 0;
        var dtw = new DTW();
        recording = true;
        drawing = true;
        myoSport.on("value", function(snapshot) {
            dtwrecording = snapshot.val().recordings[$("#dtw").val()];
            $("#status").html("Myo Comparing");
            $("#draw").html("Comparing");
            $("#status").html("Myo Comparing Drawing");
            Myo.on('accelerometer', function(data) {
                $(".dtwGraph #accelStreamx").html(dtwvalx.join(" "));
                $(".dtwGraph #accelStreamy").html(dtwvaly.join(" "));
                $(".dtwGraph #accelStreamz").html(dtwvalz.join(" "));
                accelx.push(data['x']);
                accely.push(data['y']);
                accelz.push(data['z']);
                xy = freedraw("xy", -1, 10, "orange", 3, xy[0], xy[1], xy[2], xy[3], data['x'], data['y']);
                xz = freedraw("xz", -1, 10, "orange", 3, xz[0], xz[1], xz[2], xz[3], data['x'], data['z']);
                yz = freedraw("yz", -1, 10, "orange", 3, yz[0], yz[1], yz[2], yz[3], data['y'], data['z']);
                if(i % 50 == 0 && i > 0) {
                    dtwvalx.push(dtw.compute(dtwrecording["accelStreamx"].slice(0, i), accelx));
                    dtwvaly.push(dtw.compute(dtwrecording["accelStreamy"].slice(0, i), accely));
                    dtwvalz.push(dtw.compute(dtwrecording["accelStreamz"].slice(0, i), accelz));
                }
                if (i > dtwrecording["accelStreamx"].length) {
                    $("#compare").html("Compare");
                    $("#status").html("Myo Connected");
                    Myo.off('accelerometer');
                    recording = false;
                }
                i++;
            });
        });
    } else if (recording)
        alert("I'm busy recording!");
});

//===============================================================
//===============================================================
// DTW COMPUTE ARRAYS BUTTON ONCLICK INITIALIZATION
//===============================================================
//===============================================================
$("#dtwcompute").click(function() {
    var dtw = new DTW();
    myoSport.child(username).on("value", function(snapshot) {
        var recordingsArrayA;
        var recordingsArrayB;
        myoSport.on("value", function(snapshot) {
            recordingsArrayA = snapshot.val().recordings[$("#dtwA").val()];
            recordingsArrayB = snapshot.val().recordings[$("#dtwB").val()];
            // $("#orientStreamx").html("orientStreamx cost: "+dtw.compute(recordingsArrayA["orientStreamx"], recordingsArrayB["orientStreamx"]));
            // $("#orientStreamy").html("orientStreamy cost: "+dtw.compute(recordingsArrayA["orientStreamy"], recordingsArrayB["orientStreamy"]));
            // $("#orientStreamz").html("orientStreamz cost: "+dtw.compute(recordingsArrayA["orientStreamz"], recordingsArrayB["orientStreamz"]));
            // $("#orientStreamw").html("orientStreamw cost: "+dtw.compute(recordingsArrayA["orientStreamw"], recordingsArrayB["orientStreamw"]));
            // $("#gyroStreamx").html("gyroStreamx cost: "+dtw.compute(recordingsArrayA["gyroStreamx"], recordingsArrayB["gyroStreamx"]));
            // $("#gyroStreamy").html("gyroStreamy cost: "+dtw.compute(recordingsArrayA["gyroStreamy"], recordingsArrayB["gyroStreamy"]));
            // $("#gyroStreamz").html("gyroStreamz cost: "+dtw.compute(recordingsArrayA["gyroStreamz"], recordingsArrayB["gyroStreamz"]));
            $("#accelStreamx").html("accelStreamx cost: "+dtw.compute(recordingsArrayA["accelStreamx"],recordingsArrayB["accelStreamx"]));
            $("#accelStreamy").html("accelStreamy cost: "+dtw.compute(recordingsArrayA["accelStreamy"],recordingsArrayB["accelStreamy"]));
            $("#accelStreamz").html("accelStreamz cost: "+dtw.compute(recordingsArrayA["accelStreamz"],recordingsArrayB["accelStreamz"]));
            // $("#podstream0").html("podstream0 cost: "+dtw.compute(recordingsArrayA["podstream0"], recordingsArrayB["podstream0"]));
            // $("#podstream1").html("podstream1 cost: "+dtw.compute(recordingsArrayA["podstream1"], recordingsArrayB["podstream1"]));
            // $("#podstream2").html("podstream2 cost: "+dtw.compute(recordingsArrayA["podstream2"], recordingsArrayB["podstream2"]));
            // $("#podstream3").html("podstream3 cost: "+dtw.compute(recordingsArrayA["podstream3"], recordingsArrayB["podstream3"]));
            // $("#podstream4").html("podstream4 cost: "+dtw.compute(recordingsArrayA["podstream4"], recordingsArrayB["podstream4"]));
            // $("#podstream5").html("podstream5 cost: "+dtw.compute(recordingsArrayA["podstream5"], recordingsArrayB["podstream5"]));
            // $("#podstream6").html("podstream6 cost: "+dtw.compute(recordingsArrayA["podstream6"], recordingsArrayB["podstream6"]));
            // $("#podstream7").html("podstream7 cost: "+dtw.compute(recordingsArrayA["podstream7"], recordingsArrayB["podstream7"]));
        });
    });
});

//===============================================================
//===============================================================
// RECORD MYO FUNCTION
//===============================================================
//===============================================================
function record() {
    recording = true;
    timestamp = (new Date()).getTime();
    $("#rec").html("Stop");
    $("#status").html("Myo Recording");

    Myo.on('emg', function(data){
        podstream0.push(data[0]);
        podstream1.push(data[1]);
        podstream2.push(data[2]);
        podstream3.push(data[3]);
        podstream4.push(data[4]);
        podstream5.push(data[5]);
        podstream6.push(data[6]);
        podstream7.push(data[7]);
        // $(".emgGraph #pod0").html(podstream0.slice(podstream0.length - 11, podstream0.length).join("\t"));
        // $(".emgGraph #pod1").html(podstream1.slice(podstream1.length - 11, podstream1.length).join("\t"));
        // $(".emgGraph #pod2").html(podstream2.slice(podstream2.length - 11, podstream2.length).join("\t"));
        // $(".emgGraph #pod3").html(podstream3.slice(podstream3.length - 11, podstream3.length).join("\t"));
        // $(".emgGraph #pod4").html(podstream4.slice(podstream4.length - 11, podstream4.length).join("\t"));
        // $(".emgGraph #pod5").html(podstream5.slice(podstream5.length - 11, podstream5.length).join("\t"));
        // $(".emgGraph #pod6").html(podstream6.slice(podstream6.length - 11, podstream6.length).join("\t"));
        // $(".emgGraph #pod7").html(podstream7.slice(podstream7.length - 11, podstream7.length).join("\t"));
        // var ctx = document.getElementById("canvasemgGraph").getContext("2d");
        // window.myLine = new Chart(ctx).Line(emgChartData, {responsive: true});
    });

    Myo.on('imu', function(data){
        orientStreamx.push(data["orientation"]["x"]);
        orientStreamy.push(data["orientation"]["y"]);
        orientStreamz.push(data["orientation"]["z"]);
        orientStreamw.push(data["orientation"]["w"]);
        gyroStreamx.push(data["gyroscope"]["x"]);
        gyroStreamy.push(data["gyroscope"]["y"]);
        gyroStreamz.push(data["gyroscope"]["z"]);
        accelStreamx.push(data["accelerometer"]["x"]);
        accelStreamy.push(data["accelerometer"]["y"]);
        accelStreamz.push(data["accelerometer"]["z"]);
        // $(".orientGraph #x").html(orientStreamx.slice(orientStreamx.length - 11, orientStreamx.length).join("\t"));
        // $(".orientGraph #y").html(orientStreamy.slice(orientStreamy.length - 11, orientStreamy.length).join("\t"));
        // $(".orientGraph #z").html(orientStreamz.slice(orientStreamz.length - 11, orientStreamz.length).join("\t"));
        // $(".orientGraph #w").html(orientStreamw.slice(orientStreamw.length - 11, orientStreamw.length).join("\t"));
        // $(".gyroGraph #x").html(gyroStreamx.slice(gyroStreamx.length - 11, gyroStreamx.length).join("\t"));
        // $(".gyroGraph #y").html(gyroStreamy.slice(gyroStreamy.length - 11, gyroStreamy.length).join("\t"));
        // $(".gyroGraph #z").html(gyroStreamz.slice(gyroStreamz.length - 11, gyroStreamz.length).join("\t"));
        $(".accelGraph #x").html(accelStreamx.slice(accelStreamx.length - 11, accelStreamx.length).join("\t"));
        $(".accelGraph #y").html(accelStreamy.slice(accelStreamy.length - 11, accelStreamy.length).join("\t"));
        $(".accelGraph #z").html(accelStreamz.slice(accelStreamz.length - 11, accelStreamz.length).join("\t"));
        // var ctx = document.getElementById("canvasorientGraph").getContext("2d");
        // window.myLine = new Chart(ctx).Line(orientChartData, {responsive: true});
        // var ctx = document.getElementById("canvasgyroGraph").getContext("2d");
        // window.myLine = new Chart(ctx).Line(gyroChartData, {responsive: true});
        // var ctx = document.getElementById("canvasaccelGraph").getContext("2d");
        // window.myLine = new Chart(ctx).Line(accelChartData, {responsive: true});
    });
}

//===============================================================
//===============================================================
// SAVE RECORDING FIREBASE FUNCTION
//===============================================================
//===============================================================
function saveRec(time) {
    recording = false;
    $("#rec").html("Record");
    myoSport.child("recordings").push({
        "name": prompt("Please enter a recording name", "Recording Name"),
        "time": (time - timestamp),
        "arm": "right",
        "color": prompt("Please enter a recording color", "red"),
        "orientStreamx": orientStreamx,
        "orientStreamy": orientStreamy,
        "orientStreamz": orientStreamz,
        "orientStreamw": orientStreamw,
        "gyroStreamx": gyroStreamx,
        "gyroStreamy": gyroStreamy,
        "gyroStreamz": gyroStreamz,
        "accelStreamx": accelStreamx,
        "accelStreamy": accelStreamy,
        "accelStreamz": accelStreamz,
        "podstream0": podstream0,
        "podstream1": podstream1,
        "podstream2": podstream2,
        "podstream3": podstream3,
        "podstream4": podstream4,
        "podstream5": podstream5,
        "podstream6": podstream6,
        "podstream7": podstream7
    });
}

//===============================================================
//===============================================================
// STOP RECORDING MYO FUNCTION
//===============================================================
//===============================================================
function stopRec() {
    time = (new Date()).getTime();
    Myo.off("emg");
    Myo.off("imu");
    if(recording && confirm('Do you want to save this recording?'))
        saveRec(time);
    else if(!recording)
        alert("No recording to save!");
    $("#status").html("Myo Connected");
    orientStreamx = [];
    orientStreamy = [];
    orientStreamz = [];
    orientStreamw = [];
    gyroStreamx = [];
    gyroStreamy = [];
    gyroStreamz = [];
    accelStreamx = [];
    accelStreamy = [];
    accelStreamz = [];
    podstream0 = [];
    podstream1 = [];
    podstream2 = [];
    podstream3 = [];
    podstream4 = [];
    podstream5 = [];
    podstream6 = [];
    podstream7 = [];
    recording = false;
    // $(".emgGraph #pod0").html("0");
    // $(".emgGraph #pod1").html("0");
    // $(".emgGraph #pod2").html("0");
    // $(".emgGraph #pod3").html("0");
    // $(".emgGraph #pod4").html("0");
    // $(".emgGraph #pod5").html("0");
    // $(".emgGraph #pod6").html("0");
    // $(".emgGraph #pod7").html("0");
    // $(".orientGraph #x").html("0");
    // $(".orientGraph #y").html("0");
    // $(".orientGraph #z").html("0");
    // $(".orientGraph #w").html("0");
    // $(".gyroGraph #x").html("0");
    // $(".gyroGraph #y").html("0");
    // $(".gyroGraph #z").html("0");
    $(".accelGraph #x").html("0");
    $(".accelGraph #y").html("0");
    $(".accelGraph #z").html("0");
}

//===============================================================
//===============================================================
// DRAW ENTIRE GRAPH DRAW FUNCTION
//===============================================================
//===============================================================
function draw(dataA, dataB, plane, mult, speed, color, width) {
    var canvas = document.getElementById("visual"+plane);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF7519";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(plane+" plane", canvas.width/2, 15);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width;
    var count = 0;
    var dt = .05;
    var velA = 0;
    var velB = 0;
    var oldVelA = 0;
    var oldVelB = 0;
    var posA = canvas.width/2;
    var posB = canvas.height/2;
    var recordingdrawing = setInterval(function() {
        var oldVelA = velA;
        var oldVelB = velB;
        velA = velA + mult*dataA[count] * dt;
        velB = velB + mult*dataB[count] * dt;
        ctx.beginPath();
        ctx.moveTo(posA, posB);
        posA = posA + (oldVelA + velA) * 0.5 * dt;
        posB = posB + (oldVelB + velB) * 0.5 * dt;
        ctx.lineTo(posA, posB);
        ctx.strokeStyle = color;
        ctx.stroke();
        count++;
        if(count > dataA.length || count > dataB.length)
            window.clearInterval(recordingdrawing);
    }, speed);
}

//===============================================================
//===============================================================
// DRAW GRAPH CHUNK FUNCTION
//===============================================================
//===============================================================
function freedraw(plane, mult, speed, color, width, velA, velB, posA, posB, dataA, dataB) {
    var canvas = document.getElementById("visual"+plane);
    var ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width;
    var dt = .05;
    var oldVelA = velA;
    var oldVelB = velB;
    velA = velA + mult * dataA * dt;
    velB = velB + mult * dataB * dt;
    ctx.beginPath();
    ctx.moveTo(posA, posB);
    posA = posA + (oldVelA + velA) * 0.5 * dt;
    posB = posB + (oldVelB + velB) * 0.5 * dt;
    ctx.lineTo(posA, posB);
    ctx.strokeStyle = color;
    ctx.stroke();
    return [velA, velB, posA, posB];
}

//===============================================================
//===============================================================
// DRAW 3D GRAPHS
//===============================================================
//===============================================================
function draw3D(dataA, dataB, dataC, plane, mult, speed, color, width) {
    var count = 1;
    var dt = .05;
    var velA = 0;
    var velB = 0;
    var velC = 0;
    var oldVelA = 0;
    var oldVelB = 0;
    var oldVelC = 0;
    var posA = [0];
    var posB = [0];
    var posC = [0];
    while(count <= dataA.length && count <= dataB.length) {
        var oldVelA = velA;
        var oldVelB = velB;
        var oldVelC = velC;
        velA = velA + mult*dataA[count] * dt;
        velB = velB + mult*dataB[count] * dt;
        velC = velC + mult*dataC[count] * dt;
        posA[count] = posA[count-1] + (oldVelA + velA) * 0.5 * dt;
        posB[count] = posB[count-1] + (oldVelB + velB) * 0.5 * dt;
        posC[count] = posC[count-1] + (oldVelC + velC) * 0.5 * dt;
        count++;
    }
    console.log('done populating...');
    var data = new vis.DataSet();
    for (var t = 0; t < posA.length-1; t++) {
      var x = posA[t];
      var y = posB[t];
      var z = posC[t];
      data.add({x:x, y:y, z:z});
    }
    var options = {
      width:  '400px',
      height: '400px',
      style: 'line',
      showPerspective: false,
      showGrid: true,
      keepAspectRatio: true,
      verticalRatio: 1.0,
      dataColor: color,
      showGrid: true
    };
    var container = document.getElementById('mygraph');
    var graph = new vis.Graph3d(container, data, options);
    graph.setCameraPosition(0.4, undefined, undefined);
}

function refresh3dGraph() {
    myoSport.child("recordings/"+$("#graphselect").val()).once("value", function(snapshot) {
        r = snapshot.val();
        draw3D(r['accelStreamx'], r['accelStreamy'], r['accelStreamz'], "xyz", -1, 10, r["color"], 3);
    });
}