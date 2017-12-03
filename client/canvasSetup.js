//Touch Control Functions
var drag = 0;

function mouseUp() {
  mouseIsDown = 0;
  if (drag == 0) {
    click();
  }
  //mouseXY();
}

function mouseDown(e) {
  mouseIsDown = 1;
  drag = 0;
  mouseX = e.pageX - canvas.offsetLeft;
  mouseY = e.pageY - canvas.offsetTop;
  //mouseXY();
}

function mouseMove(e) {
  drag = 1;
  mouseX = e.pageX - canvas.offsetLeft;
  mouseY = e.pageY - canvas.offsetTop;
  updateCursor();
}


function touchDown() {
  mouseIsDown = 1;
  //touchXY();
  //tttouch = 1;
}

function touchUp(e) {
  if (!e)
    e = event;
  touchCount = e.targetTouches.length;
  tttouch = 0;
  mouseIsDown = 0;
}


function mouseXY(e) {
  if (!e)
    e = event;
  canX[0] = e.pageX - canvas.offsetLeft;
  canY[0] = e.pageY - canvas.offsetTop;
  touchCount = 1;
}

function touchXY(e) {
  if (!e)
    e = event;
  //e.preventDefault();
  touchCount = e.targetTouches.length;
  for (var i = 0; i < len; i++) {
    canX[i] = e.targetTouches[i].pageX - canvas.offsetLeft;
    canY[i] = e.targetTouches[i].pageY - canvas.offsetTop;
  }
}

function init() {
  canvas = document.createElement("canvas");

  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = height * 2 * gridWidth / gridHeight;
  canvas.height = height * 2;
  pointWidth = canvas.height / gridHeight;
  pointHeight = canvas.height / gridHeight;
  if (!(!!canvas.getContext && canvas.getContext("2d"))) {
    alert("Your browser doesn't support HTML5, please update to latest version");
  }
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");

  //Control Setup
  keystate = {};
  // keyboard control
  document.addEventListener("keydown", function(evt) {
    keystate[evt.keyCode] = true;
  });
  document.addEventListener("keyup", function(evt) {
    delete keystate[evt.keyCode];
  });
  //touch control
  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mousemove", mouseMove, false);
  document.addEventListener("touchstart", mouseDown, false);
  canvas.addEventListener("touchend", mouseUp, false);
  canvas.addEventListener("touchmove", mouseMove, false);
  document.addEventListener("touchcancel", mouseUp, false);
  document.addEventListener("mouseup", mouseUp, false);
}
