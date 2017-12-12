var first = true;
var socket = io({
  transports: ['websocket'],
  upgrade: false
});
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
socket.on('update', function(data) {
  //console.log(data);
  for (var u = 0; u < data.length; u++) {
    var update = data[u];
    if (update.object) {
      if (update.object == 3) {
        grid[update.y][update.x].object = null;
      } else {
        grid[update.y][update.x].object = update.object;
      }
    }
    if (update.team && update.team != 3) {
      grid[update.y][update.x].team = update.team;
    }
  }
  //console.log(sgrid[0][0]);
});

socket.on('scores', function(data) {
  total = data.zero+data.one+data.none;
  document.getElementById('scores').innerHTML = "Blue: "+ Math.round(data.zero/total*1000)/10+"%, "+"None: "+ Math.round(data.none/total*1000)/10+"%, "+"Orange: "+ Math.round(data.one/total*1000)/10+"%";
});
