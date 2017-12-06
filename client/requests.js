//server request functions using Jquery and Ajax requests
placeSoldier = function(x, y, xDest, yDest) {
  $.ajax({
    url: 'http://localhost:2000/api/move',
    type: 'post',
    data: {
      moveType: 'placeSoldier',
      x: x,
      y: y,
      xDest: xDest,
      yDest: yDest
    },
    headers: {
      'x-access-token': token,
    },
    dataType: 'json',
    success: function(data) {
      console.info(data);
    }
  });
}
placeWall = function(x, y) {
  $.ajax({
    url: 'http://localhost:2000/api/move',
    type: 'post',
    data: {
      moveType: 'placeWall',
      x: x,
      y: y
    },
    headers: {
      'x-access-token': token,
    },
    dataType: 'json',
    success: function(data) {
      console.info(data);
    }
  });
}

login = function(email, password) {
  $.ajax({
    url: 'http://localhost:2000/api/login',
    type: 'post',
    data: {
      email: email,
      password: password
    },
    dataType: 'json',
    success: function(data) {
      console.info(data);
      token = data.token;
      localStorage.setItem('token', token);
    }
  });
}

logout = function() {
  localStorage.setItem('token', null);
}

register = function(email, password, password2, username) {
  if (password != password2) {
    alert("passwords do not match");
  } else {
    $.ajax({
      url: 'http://localhost:2000/api/register',
      type: 'post',
      data: {
        email: email,
        username: username,
        password: password
      },
      dataType: 'json',
      success: function(data) {
        console.info(data);
      }
    });
  }
}
