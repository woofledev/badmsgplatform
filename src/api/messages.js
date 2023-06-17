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

    var validated = await validateRoom(room_id);
    if (validated.exists) {
      if (/^\s*$/.test(sant)) {
        return res.status(500).send({err: "whitespace found, not sending"});
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
    } else {
      return es.sendStatus(404).send({err: "that room doesn't exist"})
    }
  });
  