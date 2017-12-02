var first = true;
var socket = io();
console.log("hello");
socket.on('start', function(data) {
    sgrid = data;
    console.log(sgrid);
});

setInterval(function () {
    socket.emit("map", null);
    console.log(sgrid);
}, 1000 / 1);