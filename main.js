Myo.connect();

Myo.on('connected', function(data, timestamp){
    console.log('connected!', this.id, data, timestamp);
    this.setLockingPolicy("none");
    this.streamEMG(true);
});

var emgData = [0,0,0,0,0,0,0,0];
Myo.on('emg', function(data){
    emgData = data;
    $(".emgGraph #pod0");
});

