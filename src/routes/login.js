app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
      return res.sendStatus(500);
    }
      if (!user) {
      return res.sendStatus(401);
    }
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
      return res.sendStatus(500);
    }
      if (!result) {
      return res.sendStatus(401);
    }
      req.session.username = username;
      res.redirect('/app');
    });
    });
  });

app.post('/register', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
  
    bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
    return res.sendStatus(500);
    }
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function (err) {
    if (err) {
    return res.sendStatus(500);
    }
    req.session.username = username;
    res.redirect('/app');
    });
  });
  });