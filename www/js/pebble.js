var UI = require('ui');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');

Accel.init();
Accel.config({
    "rate": 10,
    "samples": 1,
    "subscribe": true
});

var home = new UI.Card({
    title:'Learn Motion',
    subtitle:'Up: Record\nSelect: Info\nDown: Analyze',
    fullscreen: true,
    icon: 'images/logo.png'
});

home.on('click', 'up', function(e) {
    var recording = false;
    var card = new UI.Card();
    card.title('Recording: No');
    card.body("Press to record");
    card.show();
    card.on('click', function(e) {
        Vibe.vibrate('double');
        if(!recording) {
            recording = true;
            card.title('Recording: Yes');
            Accel.on('data', function(e) {
                var accel = e.accel;
                card.body("Accelx: " + accel.x + "\nAccely: " + accel.y + "\nAccelz: " + (accel.z+1000) + "\nvibing: " + accel.vibe + "\ntime: " + accel.time);
            });
        } else {
            recording = false;
            card.title('Recording: No');
            Accel.off("data");
            card.body("Press to record");
        }
    });
});

home.on('click', 'select', function(e) {
    var card = new UI.Card();
    card.title('Learn Motion');
    card.subtitle("Logged in as: duttaoindril");
    card.icon('images/logo.png');
    card.show();
    card.on('click', function(e) {
        Vibe.vibrate('double');
    });
});

home.on('click', 'down', function(e) {
    var comparing = false;
    var card = new UI.Card();
    var dtw = [0, 0, 0];
    card.title('Analyzing: No');
    card.body("Press to compare");
    card.show();
    card.on('click', function(e) {
        Vibe.vibrate('double');
        if(!comparing) {
            comparing = true;
            card.title('Analyzing: Yes');
            Accel.on('data', function(e) {
                var accel = e.accel;
                card.body("dtwx: "+dtw[0]+"\ndtwy: "+dtw[1]+"\ndtwz: "+dtw[2]+"\nAccelx: " + accel.x + "\nAccely: " + accel.y + "\nAccelz: " + (accel.z+1000));
            });
        } else {
            comparing = false;
            card.title('Analyzing: No');
            Accel.off("data");
            card.body("Press to compare");
        }
    });
});

home.on("click", function(e) {
   Vibe.vibrate('short');
});

home.show();