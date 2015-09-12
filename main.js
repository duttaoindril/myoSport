Myo.connect();

Myo.on('connected', function(data, timestamp){
    console.log('connected!', this.id, data, timestamp);
    this.streamEMG(true);
    Myo.setLockingPolicy("none");
});

var emgData = [0,0,0,0,0,0,0,0];
Myo.on('emg', function(data){
    emgData = data;
    $(".emgGraph #pod0").html(emgData[0]);
    $(".emgGraph #pod1").html(emgData[1]);
    $(".emgGraph #pod2").html(emgData[2]);
    $(".emgGraph #pod3").html(emgData[3]);
    $(".emgGraph #pod4").html(emgData[4]);
    $(".emgGraph #pod5").html(emgData[5]);
    $(".emgGraph #pod6").html(emgData[6]);
    $(".emgGraph #pod7").html(emgData[7]);
    $(".emgGraph #pod8").html(emgData[8]);
});

var orientData;
var gyroData;
var accelData;

Myo.on('imu', function(data){
    orientData = data["orientation"];
    gyroData = data["gyroscope"];
    accelData = data["accelerometer"];
    $(".orientGraph #x").html(orientData["x"]);
    $(".orientGraph #y").html(orientData["y"]);
    $(".orientGraph #z").html(orientData["z"]);
    $(".orientGraph #w").html(orientData["w"]);
    $(".gyroGraph #x").html(gyroData["x"]);
    $(".gyroGraph #y").html(gyroData["y"]);
    $(".gyroGraph #z").html(gyroData["z"]);
    $(".accelGraph #x").html(accelData["x"]);
    $(".accelGraph #y").html(accelData["y"]);
    $(".accelGraph #z").html(accelData["z"]);
});

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

var podstream1 = [];
var podstream2 = [];
var podstream3 = [];
var podstream4 = [];
var podstream5 = [];
var podstream6 = [];
var podstream7 = [];
var podstream8 = [];
