app.post('/api/change/pass', (req, res) =>{
    const {oldpwd, newpwd} = req.body;
    const user = req.session.username;
    db.get('SELECT password FROM users WHERE username = ?', [user], (err, row) => {
        if (err) {
            return res.status(500).json({error: "An error occurred."});
        }
        if (!row) {
            return res.status(404).json({error: "Can't find user"});
        }

        hashedpwd = row.password;
        bcrypt.compare(oldpwd, hashedpwd, (err, resl) => {
            if (err) {
                return res.status(500).json({ error: "An error occurred."});
              }
        
              if (!resl) {
                return res.status(400).json({error: "Invalid password"});
              }

            bcrypt.hash(newpwd, 10, (err, hnew) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "An error occurred." });
                }
                db.run('UPDATE users SET password = ? WHERE username = ?', [hnew, user], (err) => {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    res.json({success: true});
                });
            });
        })
    })
});
app.post('/api/change/user', (req, res) =>{
    const { newuser } = req.body;
    const user = req.session.username;

    db.run('UPDATE users SET username = ? WHERE username = ?', [newuser, user], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        req.session.username = newuser;
        res.json({ success: true });
    });
});