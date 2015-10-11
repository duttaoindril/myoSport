"use strict";
var port = 3000;

var express = require("express");
var dtw = require("dtw");
var Firebase = require("firebase");
var myo = require("myo");
var jade = require("jade");

var app = express();

app.get('/', function(req, res) {
    res.send("<h1>I absolutely love Treehouse!<h1>");
});

app.get('/dtwtest', function(req, res) {
    res.send("<h1>I absolutely love Treehouse!<h1>");
});

app.get('/fbdump', function(req, res) {
    var myoSport = new Firebase("https://myosport.firebaseio.com/");
    myoSport.child("duttaoindril").on("value", function(data) {
        res.send(data.val());
    });
});

app.listen(port, function() {
    console.log("The frontend server is running at:\nlocalhost:"+port);
});