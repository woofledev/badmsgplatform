// this file contains basic routes

// home and room handler
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/assets/home.html');
});
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

// login system (html only, check api/login.js)
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