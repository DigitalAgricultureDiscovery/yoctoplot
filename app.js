const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const keys = require('./config/keys');

// Start server listening on port 5000 or the production port
const app = express();
app.set('port', process.env.PORT || 5000);
const server = http.Server(app);

// Enable socketio for the server
const io = socketio(server);

// Listen for clients to connect to server
io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('a user disconnected');
  });
});

// Connect to mongodb database and create a collection
const MongoClient = mongodb.MongoClient;
const mongoUrl = keys.mongoURI;
MongoClient.connect(mongoUrl, function(err, db) {
  if (err) throw err;
  const dbase = db.db('yoctoplot');
  dbase.createCollection('yhub', function(err, res) {
    if (err) throw err;
    console.log('Table created!');
    db.close();
  });
});

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.post('/', function(req, res) {
  let data = req.body;

  // replace '.' with '_' in key names
  Object.keys(data).forEach(function(key) {
    if (key.indexOf('.') > -1) {
      let newKey = key.replace('.', '_');
      data[newKey] = data[key];
      delete data[key];
    }
  });

  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    const dbase = db.db('yoctoplot');
    dbase.collection('yhub').insertOne(data, function(err, res) {
      if (err) throw err;
      console.log('Record inserted into db collection');
      io.emit('update chart', data);
      db.close();
    });
  });

  res.send(req.body);
});

app.post('/getData', function(req, res) {
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    const dbase = db.db('yoctoplot');
    dbase.collection('yhub')
      .find(
        { timestamp: { $gte: new Date().getTime().toString() } },
        { timestamp: 1, 'LIGHTMK3-76EB4_lightSensor': 1, _id: 0 }
      )
      .toArray(function(err, results) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
        db.close();
      });
  });
});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
