var orientData;
var gyroData;
var accelData;
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
var state = 0;
var timestamp = 0;
var connected = false;

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
    else if(state == 0)
        record();
    else if (state == 1)
        stopRec();
});

function saveRec(time) {
    state = 0;
    $("#rec").html("Record");
    var recordingObj = [(time - timestamp), orientStreamx, orientStreamy, orientStreamz, orientStreamw, gyroStreamx, gyroStreamy, gyroStreamz, accelStreamx, accelStreamy, accelStreamz, podstream0, podstream1, podstream2, podstream3, podstream4, podstream5, podstream6, podstream7];
    $("textarea").html(recordingObj);
    //console.log(recordingObj);
    console.log("["+orientStreamx.toString(", ")+"]");
    console.log("["+orientStreamy.toString(", ")+"]");
    console.log("["+orientStreamz.toString(", ")+"]");
    console.log("["+orientStreamw.toString(", ")+"]");
    console.log("["+gyroStreamx.toString(", ")+"]");
    console.log("["+gyroStreamy.toString(", ")+"]");
    console.log("["+gyroStreamz.toString(", ")+"]");
    console.log("["+accelStreamx.toString(", ")+"]");
    console.log("["+accelStreamy.toString(", ")+"]");
    console.log("["+accelStreamz.toString(", ")+"]");
    console.log("["+podstream0.toString(", ")+"]");
    console.log("["+podstream1.toString(", ")+"]");
    console.log("["+podstream2.toString(", ")+"]");
    console.log("["+podstream3.toString(", ")+"]");
    console.log("["+podstream4.toString(", ")+"]");
    console.log("["+podstream5.toString(", ")+"]");
    console.log("["+podstream6.toString(", ")+"]");
    console.log("["+podstream7.toString(", ")+"]");
}

function record() {
    state = 1;
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

    Myo.on('imu', function(data){
        orientData = data["orientation"];
        gyroData = data["gyroscope"];
        accelData = data["accelerometer"];

        orientStreamx.push(orientData["x"]);
        orientStreamy.push(orientData["y"]);
        orientStreamz.push(orientData["z"]);
        orientStreamw.push(orientData["w"]);
        gyroStreamx.push(gyroData["x"]);
        gyroStreamy.push(gyroData["y"]);
        gyroStreamz.push(gyroData["z"]);
        accelStreamx.push(accelData["x"]);
        accelStreamy.push(accelData["y"]);
        accelStreamz.push(accelData["z"]);

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

function stopRec() {
    time = (new Date()).getTime();
    if(state > 0 && confirm('Do you want to save this recording?'))
        saveRec(time);
    else if(state == 0)
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
    state = 0;

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