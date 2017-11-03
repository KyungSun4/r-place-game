/* Middle ware */

function requiresLogin(req, res, next){
	if(req.session && req.session.userID){
	 	return next();
	}
	else{
		var err = new Error("You must be logged in!");
		err.status = 401;
		return next(err);
	}
}

// Checks if user is authentificated (log in process)

function checkIn(req, res, next){
	if(!req.session.userID){
		res.send("No! You must log in")
	}
	else{
		next();
	}
}

// Login Route

app.post('/login', function (req, res) {
  var post = req.body;
  if (post.user === 'user' && post.password === 'userpassword') {
    req.session.user_id = user_id_here;
    res.redirect('Link');
  } else {
    res.send('Redo Pass');
  }
});

// Logout Route

app.get('/logout', function (req,res)){
	delete req.session.userIDl
	res.redirect('/login')
}