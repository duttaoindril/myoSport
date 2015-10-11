"use strict";
var port = 3000;

var express = require("express");
var dtw = require("dtw");
var Firebase = require("firebase");
var myo = require("myo");
var jade = require("jade");

var app = express();
var myoSport = new Firebase("https://myosport.firebaseio.com/");

app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');

app.get('/:un?', function(req, res) {
    var username = req.params.un;
    if(username == null)
        username = "duttaoindril";
    myoSport.child(username).on("value", function(data) {
        var i = 0;
        for (var key in data.val().recordings) {
           i++;
        }
        res.render("index", {user: username, data: data.val(), length: i});
    });
});

app.get('/dtwtest', function(req, res) {
    res.send("<h1>I love Treehouse!<h1>");
});

app.get('/fbdump/:un?', function(req, res) {
    var username = req.params.un;
    if(username == null)
        username = "duttaoindril";
    myoSport.child(username).on("value", function(data) {
        res.send(data.val());
    });
});

app.listen(port, function() {
    console.log("The frontend server is running at:\nlocalhost:"+port);
});