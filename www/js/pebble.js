var UI = require('ui');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');
Accel.init();
Accel.config({
    "rate": 10,
    "samples": 1,
    "subscribe": true
});

// Create a Card with title and subtitle
var card = new UI.Card({
    title:'Learn Motion',
    subtitle:'Connected!',
    fullscreen: true,
    scrollable: true
});

// Display the Card
card.show();
card.icon('images/logo.png');

card.on('click', function(e) {
    // Send a long vibration to the user wrist
    if(e.button == "select")
        Vibe.vibrate('long');
    else if (e.button == "down")
        Vibe.vibrate('short');
    else if (e.button == "up") {
        Vibe.vibrate('double');
        Accel.off('data');
    }
    card.subtitle('Button ' + e.button + ' pressed.');
});

Accel.on('data', function(e) {
    var accel = e.accel;
    card.subtitle("Accelx: " + accel.x + "\nAccely: " + accel.y + "\nAccelz: " + accel.z + "\n");
});