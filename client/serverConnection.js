var first = true;
var socket = io();
console.log("hello");
socket.on('start', function(data) {
  sgrid = data;
  if (first) {
    console.log(map);
    first = false
  }
});
