//var myoSport = new Firebase("https://myosport.firebaseio.com/");
Parse.initialize("jphlO58koRaLLMPkLXFjKRmwezM96giWv2O5GPJj", "WGs1wWm7S8ioMZFBW3M5sE5JSwus2f3jqvuRKxXD");

var Recording = Parse.Object.extend("Recording");
var recording1 = new Recording();

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
var timestamp = 0;

var recordingsArray = [];

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

$("#rec").click(function() {
    Myo.connect();
    if(connected == false)
        alert("Please connect your Myo first.");
    else if(!recording)
        record();
    else if (recording)
        stopRec();
});

$("#dtwcompute").click(function() {
    var dtw = new DTW();
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
    });

    Myo.on('imu', function(data){orientStreamx.push(data["orientation"]["x"]);
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
    });
}

function saveRec(time) {
    recording = false;
    $("#rec").html("Record");

    recording1.set("name", prompt("Please enter a recording name", "Recording "+recordingsArray.length+1));
    recording1.set("time", (time - timestamp));
    recording1.set("color", prompt("Please enter a recording color", "red"));
    recording1.set("orientStreamx", orientStreamx);
    recording1.set("orientStreamy", orientStreamy);
    recording1.set("orientStreamz", orientStreamz);
    recording1.set("orientStreamw", orientStreamw);
    recording1.set("gyroStreamx", gyroStreamx);
    recording1.set("gyroStreamy", gyroStreamy);
    recording1.set("gyroStreamz", gyroStreamz);
    recording1.set("accelStreamx", accelStreamx);
    recording1.set("accelStreamy", accelStreamy);
    recording1.set("accelStreamz", accelStreamz);
    recording1.set("podstream0", podstream0);
    recording1.set("podstream1", podstream1);
    recording1.set("podstream2", podstream2);
    recording1.set("podstream3", podstream3);
    recording1.set("podstream4", podstream4);
    recording1.set("podstream5", podstream5);
    recording1.set("podstream6", podstream6);
    recording1.set("podstream7", podstream7);

    recording1.save(null, {
        success: function(recording1) {
        // Execute any logic that should take place after the object is saved.
        alert('New object created with objectId: ' + recording1.id);
        },
        error: function(recording1, error) {
        // Execute any logic that should take place if the save fails.
        alert('Failed to create new object, with error code: ' + error.message);
        // error is a Parse.Error with an error code and message.
        }
    });

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

function stopRec() {
    time = (new Date()).getTime();
    if(recording && confirm('Do you want to save this recording?'))
        saveRec(time);
    else if(!recording)
        alert("No recording to save!");
    $("#status").html("Myo Connected");
    Myo.off("emg");
    Myo.off("imu");
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

function draw(dataA, dataB, plane, mult, speed, color, width) {
    var canvas = document.getElementById("visual"+plane);
    var ctx = canvas.getContext("2d")
    ctx.fillStyle = "#FF7519";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(plane+" plane", canvas.width/2, 15)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width
    var count = 0;
    var dt = .05;
    var velA = 0;
    var velB = 0;
    var oldVelA = 0;
    var oldVelB = 0;
    var posA = canvas.width/2;
    var posB = canvas.height/2
    var drawing = setInterval(function() {
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
            window.clearInterval(drawing);
    }, speed);
}