var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var crypto = require('crypto');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcrypt');
var session = require('express-session');
var htmlsant = require('sanitize-html')

app.use('/local/',express.static(__dirname+'/assets'));
app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({
  secret: 'secretkeyhere', // secret key
  resave: false,
  saveUninitialized: true
}));

var db = new sqlite3.Database("platform.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('connected to platform.db');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    pfpuri TEXT NOT NULL,
    room_id TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    creator TEXT NOT NULL
  )`);
});

function randId(length){
  const string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  var rand = crypto.randomBytes(length);
  var res = new Array(length);

  for (let i=0;i<length;i++){
    res[i] = string[rand[i] % string.length]
  }
  return res.join('');
}

app.get('/messages', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  const roomId = req.query.room_id;
  db.all('SELECT * FROM messages WHERE room_id = ?', [roomId], (err, messages) => {
    if (err) {
      return res.sendStatus(500);
    }
      res.send(messages);
    });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/assets/home.html');
});

function validateRoom(roomid){
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM rooms WHERE id = ?', [roomid], (err, row)=>{
      if (err){
        console.error(err.message);
        reject(err);
      } else if (row) {
        resolve({exists: true, name: row.name, creator: row.creator});
      } else {
        resolve(false);
      }
    })
  });
}
app.get('/app', (req,res)=>{
  if (!req.session.username) {
    return res.redirect('/login');
  }
  res.render(__dirname+"/pages/app_home", {name: req.session.username, error: ""})
})
app.get('/app/:roomid', async (req,res)=>{
  if(!req.session.username){
     return res.redirect('/login');
  }
  const roomid = req.params.roomid
  const roominfo = await validateRoom(roomid)
    if (roominfo.exists){
      res.render(__dirname+'/pages/app', {roomid: roomid, roomname: roominfo.name, roomcreator: roominfo.creator})
    } else {
     res.render(__dirname+"/pages/app_home", {name: req.session.username, error: "This room does not exist or a server error occurred."})
  }
})

app.get('/messages/:roomid/:user', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  var roomId = req.params.roomid;
  var user = req.params.user;
  db.all('SELECT * FROM messages WHERE room_id = ? AND name = ?', [roomId, user], (err, messages) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.send(messages);
  });
});

app.post('/messages', (req, res) => {
  const name = req.session.username;
  const { message, pfpuri, room_id } = req.body;
  var sant = htmlsant(message, {allowedTags: ['img','video','code'], allowedAttributes: []});
  if (/^\s*$/.test(sant)) {
    return res.send('<script>alert("Bad request: whitespaces.")</script>');
  }
  db.run('INSERT INTO messages (name, message, pfpuri, room_id) VALUES (?, ?, ?, ?)', [name, sant, pfpuri, room_id], (err) => {
    if (err) {
      console.error(err.message);
      res.sendStatus(500);
    } else {
      io.emit(room_id, {name, message: sant, pfpuri});
      res.sendStatus(200);
    }
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

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/pages'+'/register.html');
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/pages'+'/login.html');
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.redirect('/');
  });
});

app.post('/api/createroom', (req, res) =>{
  const {roomname} = req.body;
  const creator = req.session.username
  const roomId = randId(12);
  db.run('INSERT INTO rooms (id, name, creator) VALUES (?, ?, ?)', [roomId, roomname, creator], (err) => {
    if (err) {
      console.error(err.message);
      res.sendStatus(500);
    } else {
      res.send({ roomId });
    }
  });
})
app.get('/join/:id', (req, res) => {
  const roomId = req.params.id;
  const username = req.session.username;
  db.get('SELECT * FROM rooms WHERE id = ?', [roomId], (err, room) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!room) {
      return res.send({ error: 'Room not found.' });
    }
    db.run('INSERT INTO room_users (username, room_id) VALUES (?, ?)', [username, roomId], (err) => {
      if (err) {
        console.error(err.message);
        res.sendStatus(500);
      } else {
        res.send({ room });
      }
    });
  });
});


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
  
app.get('/logout', (req, res) => {
  req.session.username = null;
  res.redirect('/');
});

  
var server = http.listen(80, () => { // port
  console.log('server is listening on port', server.address().port);
});
