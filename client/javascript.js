var map;
var socket = io();
console.log("hello");
socket.on('start', function(data) {
  map = data;
  console.log(map);
});
