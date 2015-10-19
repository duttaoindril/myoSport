var myoSport = new Firebase("https://myosport.firebaseio.com/");
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
var connected = false;
var recording = false;
var drawing = false;
var timestamp = 0;
var username = prompt("Please enter your username", "duttaoindril");
var myoSport = new Firebase("https://myosport.firebaseio.com/"+username);

//=========================================================================================================================================
//=========================================================================================================================================
// FIREBASE INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
myoSport.on("value", function(snapshot) {
    $("#name").html("");
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
    var recordings = snapshot.val().recordings;
    for (key in recordings) {
        fbrecording = recordings[key];
        $("#name").html($("#name").html() + "<td>" + fbrecording["name"] + "</td>");
        $("#time").html($("#time").html() + "<td>" + fbrecording["time"] + "</td>");
        $("#arm").html($("#arm").html() + "<td>" + fbrecording["arm"] + "</td>");
        $("#color").html($("#color").html() + "<td>" + fbrecording["color"] + "</td>");
        $("#dtw").append($("<option></option>").attr("value", key).text(fbrecording["name"]));
        $("#dtwA").append($("<option></option>").attr("value", key).text(fbrecording["name"]));
        $("#dtwB").append($("<option></option>").attr("value", key).text(fbrecording["name"]));
        draw(fbrecording['accelStreamx'], fbrecording['accelStreamy'], "xy", -1, 10, fbrecording["color"], 3);
        draw(fbrecording['accelStreamx'], fbrecording['accelStreamz'], "xz", -1, 10, fbrecording["color"], 3);
        draw(fbrecording['accelStreamy'], fbrecording['accelStreamz'], "yz", -1, 10, fbrecording["color"], 3);
    }
});

//=========================================================================================================================================
//=========================================================================================================================================
// MYO INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
Myo.connect();

Myo.on('connected', function(data, timestamp) {
    this.streamEMG(true);
    Myo.setLockingPolicy("none");
    connected = true;
    $("#status").html("Myo Connected");
});

Myo.on('disconnected', function() {
    connected = false;
    stopRec();
    $("#status").html("Myo <b>Not</b> Connected");
});

//=========================================================================================================================================
//=========================================================================================================================================
// RECORDING BUTTON ONCLICK INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
$("#rec").click(function() {
    Myo.connect();
    if(connected == false || drawing)
        alert("Please connect your Myo, or stop drawing first.");
    else if(!recording)
        record();
    else if (recording)
        stopRec();
});

//=========================================================================================================================================
//=========================================================================================================================================
// FREE DRAW BUTTON ONCLICK INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
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

//=========================================================================================================================================
//=========================================================================================================================================
// DTW COMPARE BUTTON ONCLICK INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
$("#compare").click(function() {
    Myo.connect();
    if(connected == false)
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
        });
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
    } else if (recording)
        alert("I'm busy comparing!");
});

//=========================================================================================================================================
//=========================================================================================================================================
// DTW COMPUTE ARRAYS BUTTON ONCLICK INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
$("#dtwcompute").click(function() {
    var dtw = new DTW();
    myoSport.child(username).on("value", function(snapshot) {
        recordingsArray = snapshot.val().recordings;
        $("#orientStreamx").html("orientStreamx cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["orientStreamx"], recordingsArray[$("#dtwB").val()]["orientStreamx"]));
        $("#orientStreamy").html("orientStreamy cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["orientStreamy"], recordingsArray[$("#dtwB").val()]["orientStreamy"]));
        $("#orientStreamz").html("orientStreamz cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["orientStreamz"], recordingsArray[$("#dtwB").val()]["orientStreamz"]));
        $("#orientStreamw").html("orientStreamw cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["orientStreamw"], recordingsArray[$("#dtwB").val()]["orientStreamw"]));
        $("#gyroStreamx").html("gyroStreamx cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["gyroStreamx"], recordingsArray[$("#dtwB").val()]["gyroStreamx"]));
        $("#gyroStreamy").html("gyroStreamy cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["gyroStreamy"], recordingsArray[$("#dtwB").val()]["gyroStreamy"]));
        $("#gyroStreamz").html("gyroStreamz cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["gyroStreamz"], recordingsArray[$("#dtwB").val()]["gyroStreamz"]));
        $("#accelStreamx").html("accelStreamx cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["accelStreamx"], recordingsArray[$("#dtwB").val()]["accelStreamx"]));
        $("#accelStreamy").html("accelStreamy cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["accelStreamy"], recordingsArray[$("#dtwB").val()]["accelStreamy"]));
        $("#accelStreamz").html("accelStreamz cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["accelStreamz"], recordingsArray[$("#dtwB").val()]["accelStreamz"]));
        $("#podstream0").html("podstream0 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream0"], recordingsArray[$("#dtwB").val()]["podstream0"]));
        $("#podstream1").html("podstream1 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream1"], recordingsArray[$("#dtwB").val()]["podstream1"]));
        $("#podstream2").html("podstream2 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream2"], recordingsArray[$("#dtwB").val()]["podstream2"]));
        $("#podstream3").html("podstream3 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream3"], recordingsArray[$("#dtwB").val()]["podstream3"]));
        $("#podstream4").html("podstream4 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream4"], recordingsArray[$("#dtwB").val()]["podstream4"]));
        $("#podstream5").html("podstream5 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream5"], recordingsArray[$("#dtwB").val()]["podstream5"]));
        $("#podstream6").html("podstream6 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream6"], recordingsArray[$("#dtwB").val()]["podstream6"]));
        $("#podstream7").html("podstream7 cost: "+dtw.compute(recordingsArray[$("#dtwA").val()]["podstream7"], recordingsArray[$("#dtwB").val()]["podstream7"]));
    });
});

//=========================================================================================================================================
//=========================================================================================================================================
// RECORD MYO FUNCTION
//=========================================================================================================================================
//=========================================================================================================================================
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
        $(".emgGraph #pod0").html(podstream0.slice(podstream0.length - 11, podstream0.length).join("\t"));
        $(".emgGraph #pod1").html(podstream1.slice(podstream1.length - 11, podstream1.length).join("\t"));
        $(".emgGraph #pod2").html(podstream2.slice(podstream2.length - 11, podstream2.length).join("\t"));
        $(".emgGraph #pod3").html(podstream3.slice(podstream3.length - 11, podstream3.length).join("\t"));
        $(".emgGraph #pod4").html(podstream4.slice(podstream4.length - 11, podstream4.length).join("\t"));
        $(".emgGraph #pod5").html(podstream5.slice(podstream5.length - 11, podstream5.length).join("\t"));
        $(".emgGraph #pod6").html(podstream6.slice(podstream6.length - 11, podstream6.length).join("\t"));
        $(".emgGraph #pod7").html(podstream7.slice(podstream7.length - 11, podstream7.length).join("\t"));
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
        $(".orientGraph #x").html(orientStreamx.slice(orientStreamx.length - 11, orientStreamx.length).join("\t"));
        $(".orientGraph #y").html(orientStreamy.slice(orientStreamy.length - 11, orientStreamy.length).join("\t"));
        $(".orientGraph #z").html(orientStreamz.slice(orientStreamz.length - 11, orientStreamz.length).join("\t"));
        $(".orientGraph #w").html(orientStreamw.slice(orientStreamw.length - 11, orientStreamw.length).join("\t"));
        $(".gyroGraph #x").html(gyroStreamx.slice(gyroStreamx.length - 11, gyroStreamx.length).join("\t"));
        $(".gyroGraph #y").html(gyroStreamy.slice(gyroStreamy.length - 11, gyroStreamy.length).join("\t"));
        $(".gyroGraph #z").html(gyroStreamz.slice(gyroStreamz.length - 11, gyroStreamz.length).join("\t"));
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

//=========================================================================================================================================
//=========================================================================================================================================
// SAVE RECORDING FIREBASE FUNCTION
//=========================================================================================================================================
//=========================================================================================================================================
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
    // $("#name").html($("#name").html() + " " + recordingObj["name"]);
    // $("#time").html($("#time").html() + " " + recordingObj["time"]);
    // $("#arm").html($("#arm").html() + " " + recordingObj["arm"]);
    // $("#color").html($("#color").html() + " " + recordingObj["color"]);
    // $("#dtwA").append($("<option></option>").attr("value", recordingsArray.length).text(recordingObj["name"]));
    // $("#dtwB").append($("<option></option>").attr("value", recordingsArray.length).text(recordingObj["name"]));
    // draw(recordingObj['accelStreamx'], recordingObj['accelStreamy'], "xy", -1, 10, recordingObj["color"], 3);
    // draw(recordingObj['accelStreamx'], recordingObj['accelStreamz'], "xz", -1, 10, recordingObj["color"], 3);
    // draw(recordingObj['accelStreamy'], recordingObj['accelStreamz'], "yz", -1, 10, recordingObj["color"], 3);
    $("#name").html($("#name").html() + " " + recordingObj["name"]);
    $("#time").html($("#time").html() + " " + recordingObj["time"]);
    $("#arm").html($("#arm").html() + " " + recordingObj["arm"]);
    $("#color").html($("#color").html() + " " + recordingObj["color"]);
    $("#dtwA").append($("<option></option>").attr("value", recordingsArray.length).text(recordingObj["name"]));
    $("#dtwB").append($("<option></option>").attr("value", recordingsArray.length).text(recordingObj["name"]));
    console.log(recordingObj);
    recordingsArray.push(recordingObj);
    draw(recordingObj['accelStreamx'], recordingObj['accelStreamy'], "xy", -1, 10, recordingObj["color"], 3);
    draw(recordingObj['accelStreamx'], recordingObj['accelStreamz'], "xz", -1, 10, recordingObj["color"], 3);
    draw(recordingObj['accelStreamy'], recordingObj['accelStreamz'], "yz", -1, 10, recordingObj["color"], 3);
}

//=========================================================================================================================================
//=========================================================================================================================================
// STOP RECORDING MYO FUNCTION
//=========================================================================================================================================
//=========================================================================================================================================
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
    $(".emgGraph #pod0").html("0");
    $(".emgGraph #pod1").html("0");
    $(".emgGraph #pod2").html("0");
    $(".emgGraph #pod3").html("0");
    $(".emgGraph #pod4").html("0");
    $(".emgGraph #pod5").html("0");
    $(".emgGraph #pod6").html("0");
    $(".emgGraph #pod7").html("0");
    $(".orientGraph #x").html("0");
    $(".orientGraph #y").html("0");
    $(".orientGraph #z").html("0");
    $(".orientGraph #w").html("0");
    $(".gyroGraph #x").html("0");
    $(".gyroGraph #y").html("0");
    $(".gyroGraph #z").html("0");
    $(".accelGraph #x").html("0");
    $(".accelGraph #y").html("0");
    $(".accelGraph #z").html("0");
}

//=========================================================================================================================================
//=========================================================================================================================================
// DRAW ENTIRE GRAPH DRAW FUNCTION
//=========================================================================================================================================
//=========================================================================================================================================
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

//=========================================================================================================================================
//=========================================================================================================================================
// DRAW GRAPH CHUNK FUNCTION
//=========================================================================================================================================
//=========================================================================================================================================
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

//=========================================================================================================================================
//=========================================================================================================================================
// POSSIBLE REPLACE NUMBERS WITH GRAPH COMMENTED OUT CODE
//=========================================================================================================================================
//=========================================================================================================================================
// var emgChartData = {
//     labels : [],
//     datasets : [{
//         label: "podstream0",
//         fillColor : "rgba(0, 0, 0, 0)",
//         strokeColor : "rgba(255,0,0,1)",
//         pointColor : "rgba(200,0,0,1)",
//         data : podstream0
//     }, {
//         label: "podstream1",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,255,0,1)",
//         pointColor : "rgba(0,200,0,1)",
//         data : podstream1
//     }, {
//         label: "podstream2",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,0,255,1)",
//         pointColor : "rgba(0,0,200,1)",
//         data : podstream2
//     }, {
//         label: "podstream3",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(200,200,200,1)",
//         pointColor : "rgba(150,150,150,1)",
//         data : podstream3
//     }, {
//         label: "podstream4",
//         fillColor : "rgba(0, 0, 0, 0)",
//         strokeColor : "rgba(255,0,0,1)",
//         pointColor : "rgba(200,0,0,1)",
//         data : podstream4
//     }, {
//         label: "podstream5",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,255,0,1)",
//         pointColor : "rgba(0,200,0,1)",
//         data : podstream5
//     }, {
//         label: "podstream6",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,0,255,1)",
//         pointColor : "rgba(0,0,200,1)",
//         data : podstream6
//     }, {
//         label: "podstream7",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(200,200,200,1)",
//         pointColor : "rgba(150,150,150,1)",
//         data : podstream7
//     }]
// };

// var orientChartData = {
//     labels : [],
//     datasets : [{
//         label: "orientStreamx",
//         fillColor : "rgba(0, 0, 0, 0)",
//         strokeColor : "rgba(255,0,0,1)",
//         pointColor : "rgba(200,0,0,1)",
//         data : orientStreamx
//     }, {
//         label: "orientStreamy",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,255,0,1)",
//         pointColor : "rgba(0,200,0,1)",
//         data : orientStreamy
//     }, {
//         label: "orientStreamz",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,0,255,1)",
//         pointColor : "rgba(0,0,200,1)",
//         data : orientStreamz
//     }, {
//         label: "orientStreamz",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(200,200,200,1)",
//         pointColor : "rgba(150,150,150,1)",
//         data : orientStreamz
//     }]
// };

// var gyroChartData = {
//     labels : [],
//     datasets : [{
//         label: "gyroStreamx",
//         fillColor : "rgba(0, 0, 0, 0)",
//         strokeColor : "rgba(255,0,0,1)",
//         pointColor : "rgba(200,0,0,1)",
//         data : gyroStreamx
//     }, {
//         label: "gyroStreamy",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,255,0,1)",
//         pointColor : "rgba(0,200,0,1)",
//         data : gyroStreamy
//     }, {
//         label: "gyroStreamz",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,0,255,1)",
//         pointColor : "rgba(0,0,200,1)",
//         data : gyroStreamz
//     }]
// };

// var accelChartData = {
//     labels : [],
//     datasets : [{
//         label: "accelStreamx",
//         fillColor : "rgba(0, 0, 0, 0)",
//         strokeColor : "rgba(255,0,0,1)",
//         pointColor : "rgba(200,0,0,1)",
//         data : accelStreamx
//     }, {
//         label: "accelStreamy",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,255,0,1)",
//         pointColor : "rgba(0,200,0,1)",
//         data : accelStreamy
//     }, {
//         label: "accelStreamz",
//         fillColor : "rgba(0,0,0,0)",
//         strokeColor : "rgba(0,0,255,1)",
//         pointColor : "rgba(0,0,200,1)",
//         data : accelStreamz
//     }]
// };

// var ctx = document.getElementById("canvasemgGraph").getContext("2d");
// window.myLine = new Chart(ctx).Line(emgChartData, {responsive: true});
// var ctx = document.getElementById("canvasorientGraph").getContext("2d");
// window.myLine = new Chart(ctx).Line(orientChartData, {responsive: true});
// var ctx = document.getElementById("canvasgyroGraph").getContext("2d");
// window.myLine = new Chart(ctx).Line(gyroChartData, {responsive: true});
// var ctx = document.getElementById("canvasaccelGraph").getContext("2d");
// window.myLine = new Chart(ctx).Line(accelChartData, {responsive: true});
