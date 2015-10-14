//===============================================================
//===============================================================
// NPM PACKAGES INITIALIZATION + Myo Config
//===============================================================
//===============================================================
var firebase = require("firebase");
var DTW = require("dtw");
var myo = require("myo");
myo.onError = function() {console.log("Error connecting Myo. Try refreshing the page and/or restarting Myo Connect.\n")}
//===============================================================
//===============================================================
// GENERAL GLOBAL VALUES INITIALIZATION
//===============================================================
//===============================================================
var timestamp = 0;
var username = process.argv[2];
if (username == null)
    username = "duttaoindril";
console.log("\nLogged into user account of ", username, "\n");
//===============================================================
//===============================================================
// FIREBASE GLOBAL VALUES INITIALIZATION
//===============================================================
//===============================================================
var keys = [];
var connected = false;
var recording = false;
var halt = false;
var myoSport = new firebase("https://myosport.firebaseio.com/"+username);
var name = "";
var color = "";
var arm = "";
var direction = "";
//var orientationoffset = {};
//===============================================================
//===============================================================
// FIREBASE DATA PULLS
//===============================================================
//===============================================================
myoSport.child("recordings").on('value', function(snapshot) {
    for (key in snapshot.val()) {keys.push(key);}
});
myoSport.child("connected").on('value', function(snapshot) {
    connected = snapshot.val();
});
myoSport.child("halt").on('value', function(snapshot) {
    halt = snapshot.val();
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
    //orientationoffset = data.myoorientationoffset;
});
//===============================================================
//===============================================================
// MYO FUNCTIONS; UPDATES FIREBASE
//===============================================================
//===============================================================
// Attempt to connect to myo
myo.connect();
// On connect event handler; vibrate once and set myo configs and push connected as true to firebase
myo.on('connected', function(data, timestamp) {
    this.streamEMG(true);
    this.setLockingPolicy("none");
    this.vibrate("short");
    myoSport.child("connected").set(true);
    //console.log(this.requestBatteryLevel());
    if(this.batteryLevel < 10)
        console.log("Please Charge your Myo! ", this.batteryLevel);
    //if(this.warm < 10);
});
// Check out all the info you can get from the myo and screw yourself over lol bro sigh
// On arm synced event handler; vibrate twice and send arm, direction, and offset to firebase
myo.on('arm_synced', function() {
    this.vibrate("short");
    this.vibrate("short");
    myoSport.child("details/myoarm").set(this.arm);
    myoSport.child("details/myodirection").set(this.direction);
    myoSport.child("details/myoorientationoffset").set(this.orientationOffset);
});
// On arm unsynced event handler; vibrate thrice and reset arm, direction, and offset on firebase
myo.on('arm_unsynced', function() {
    this.vibrate("short");
    this.vibrate("short");
    this.vibrate("short");
    myoSport.child("details/myoarm").set("unknown");
    myoSport.child("details/myodirection").set("unknown");
    myoSport.child("details/myoorientationoffset").set("unknown");
});
// On disconnect event handler; push connected as false to firebase
myo.on('disconnected', function() {
    myoSport.child("connected").set(false);
});
//===============================================================
//===============================================================
// GENERAL NODE COMMANDER; PROVIDES OTHER FUNCS INTERFACE
//===============================================================
//===============================================================
// Assign into commander somehow
//Simple Fireabase Data logging
function logdat(context) {
    console.log(context)
    console.log(keys);
    console.log(connected, typeof connected);
    console.log(recording, typeof recording);
    console.log();
}
//===============================================================
//===============================================================
// GENERAL MYO FUNCTIONS; UPDATES FIREBASE
//===============================================================
//===============================================================
function record() {
    Myo.connect();
    if(connected == false || recording) {
        console.log("Please connect your Myo or stop recording!");
        return null;
    }
    myoSport.child("recording").set(true);
    myoSport.child("halt").set(false);
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
    console.log("Recoring...");
    timestamp = (new Date()).getTime();
    myoSport.child("halt").on('value', function(snapshot) {
        halt = snapshot.val();
        if(!halt) {
            Myo.on('emg', function(data) {
                podstream0.push(data[0]);
                podstream1.push(data[1]);
                podstream2.push(data[2]);
                podstream3.push(data[3]);
                podstream4.push(data[4]);
                podstream5.push(data[5]);
                podstream6.push(data[6]);
                podstream7.push(data[7]);
            });
            Myo.on('imu', function(data) {
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
            });
        } else {
            var time = (new Date()).getTime();
            Myo.off("emg");
            Myo.off("imu");
            myoSport.child("recording").set(false);

            //Do something to get name and color

            myoSport.child("recordings").push({
                "name": name,
                "time": (time - timestamp),
                "arm": arm,
                "color": color,
                "direction": direction,
                //"orientationoffset": orientationoffset,
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
    });
}
//===============================================================
//===============================================================
// DTW FUNCTIONS; USES FIREBASE
//===============================================================
//===============================================================
//Pass in two recording keys to compare dtws
function fullCompare(keya, keyb) {
    var dtw = new DTW();
    var rA;
    var rB;
    myoSport.child("recordings").once("value", function(snapshot) {
        rA = (snapshot.val())[keya];
        rB = (snapshot.val())[keyb];
        console.log("accelStreamx: ", dtw.compute(rA["accelStreamx"], rB["accelStreamx"]));
        console.log("accelStreamy: ", dtw.compute(rA["accelStreamy"], rB["accelStreamy"]));
        console.log("accelStreamz: ", dtw.compute(rA["accelStreamz"], rB["accelStreamz"]));
    });
}
//Pass in one recording key to compare dtw with live myo movement
function liveCompare(key, interval) {
    Myo.connect();
    if(connected == false || recording) {
        console.log("Please connect your Myo or stop recording!");
        return null;
    }
    var dtw = new DTW();
    var accelx = [];
    var accely = [];
    var accelz = [];
    var dtwvalx = [];
    var dtwvaly = [];
    var dtwvalz = [];
    var dtwrecording;
    var i = 0;
    var max;
    myoSport.child("recordings/"+key).once("value", function(snapshot) {
        dtwrecording = snapshot.val();
        max = dtwrecording["accelStreamx"].length;
        myoSport.child("recording").set(true);
        Myo.on('accelerometer', function(data) {
            accelx.push(data['x']);
            accely.push(data['y']);
            accelz.push(data['z']);
            if(i % interval == 0 && i > 0) {
                dtwvalx.push(dtw.compute(dtwrecording["accelStreamx"].slice(0, i), accelx));
                dtwvaly.push(dtw.compute(dtwrecording["accelStreamy"].slice(0, i), accely));
                dtwvalz.push(dtw.compute(dtwrecording["accelStreamz"].slice(0, i), accelz));
            }
            if (i > max) {
                Myo.off('accelerometer');
                myoSport.child("recording").set(false);
                console.log("accelStreamx: ", dtwvalx);
                console.log("accelStreamy: ", dtwvaly);
                console.log("accelStreamz: ", dtwvalz);
                return max;
            }
            i++;
        });
    });
}