var myoSport = new Firebase("https://myosport.firebaseio.com/");
var username = prompt("Please enter your username", "duttaoindril");
var myoSport = new Firebase("https://myosport.firebaseio.com/"+username);
var fbrecordings = [];

//=========================================================================================================================================
//=========================================================================================================================================
// FIREBASE INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
myoSport.on("value", function(snapshot) {
    $("#data_select").html("");
    var recordings = snapshot.val().recordings;
    var count = 0;
    for (key in recordings) {
        fbrecordings[count] = recordings[key];
        $("#data_select").append($("<option></option>").attr("value", key).text(fbrecordings[count]["name"]));
        count++;
    }
});


//=========================================================================================================================================
//=========================================================================================================================================
// FREE DRAW BUTTON ONCLICK INITIALIZATION
//=========================================================================================================================================
//=========================================================================================================================================
$("#draw3D").click(function() {
    console.log("drawing...");
    var recSelect = document.getElementById("data_select");
    var idx = recSelect.selectedIndex;
    var fbrecording = fbrecordings[idx];
    draw3D(fbrecording['accelStreamx'], fbrecording['accelStreamy'], fbrecording['accelStreamz'], "xyz", -1, 10, fbrecording["color"], 3);
});

//=========================================================================================================================================
//=========================================================================================================================================
// DRAW ENTIRE GRAPH DRAW FUNCTION
//=========================================================================================================================================
//=========================================================================================================================================
function draw3D(dataA, dataB, dataC, plane, mult, speed, color, width) {
    var count = 1;
    var dt = .05;
    var velA = 0;
    var velB = 0;
    var velC = 0;
    var oldVelA = 0;
    var oldVelB = 0;
    var oldVelC = 0;
    var posA = [0];
    var posB = [0];
    var posC = [0];
    while(count <= dataA.length && count <= dataB.length) {
        var oldVelA = velA;
        var oldVelB = velB;
        var oldVelC = velC;
        velA = velA + mult*dataA[count] * dt;
        velB = velB + mult*dataB[count] * dt;
        velC = velC + mult*dataC[count] * dt;
        posA[count] = posA[count-1] + (oldVelA + velA) * 0.5 * dt;
        posB[count] = posB[count-1] + (oldVelB + velB) * 0.5 * dt;
        posC[count] = posC[count-1] + (oldVelC + velC) * 0.5 * dt;
        count++;
    }
    console.log('done populating...');
    var data = new vis.DataSet();
    for (var t = 0; t < posA.length-1; t++) {
      var x = posA[t];
      var y = posB[t];
      var z = posC[t];
      data.add({x:x, y:y, z:z});
    }
    var options = {
      width:  '400px',
      height: '400px',
      style: 'line',
      showPerspective: false,
      showGrid: true,
      keepAspectRatio: true,
      verticalRatio: 1.0,
      dataColor.stroke: color
    };
    var container = document.getElementById('mygraph');
    var graph = new vis.Graph3d(container, data, options);
    graph.setCameraPosition(0.4, undefined, undefined);
}