var first = true;
var socket = io({transports: ['websocket'], upgrade: false});
console.log("hello");
socket.on('start', function(data) {
  console.log("tes");
  grid = data;
  console.log(data[0][0]);
});

socket.on('map', function(data) {
  //console.log("m");
  grid = data;
  //console.log(sgrid[0][0]);
});
