// init express
app.use('/local/',express.static(__dirname+'/assets'));
app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({
  secret: conf.SECRETKEY,
  resave: false,
  saveUninitialized: true
}));

// db connection
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
    name TEXT,
    creator TEXT NOT NULL
  )`);
});

// functions (random id, validating rooms)
function randId(length){
  const string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  var rand = crypto.randomBytes(length);
  var res = new Array(length);

  for (let i=0;i<length;i++){
    res[i] = string[rand[i] % string.length]
  }
  return res.join('');
}
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