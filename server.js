var express = require('express');
var conf = require('./config.json');
var bodyParser = require('body-parser')
var app = express();
var crypto = require('crypto');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcrypt');
var session = require('express-session');
var htmlsant = require('sanitize-html')

// [ircmp] src/init.js
// [ircmp] src/api/messages.js
// [ircmp] src/api/rooms.js
// [ircmp] src/api/pwdchange.js
// [ircmp] src/routes/login.js
// [ircmp] src/routes/proxy.js
// [ircmp] src/routes.js

var server = http.listen(conf.PORT, () => {
  console.log('server is listening on port', server.address().port);
});
