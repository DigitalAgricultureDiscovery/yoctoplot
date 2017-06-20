var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

var app = express();
var server = http.Server(app);
var io = socketio(server);
var MongoClient = mongodb.MongoClient;

var mongoUrl = 'mongodb://localhost:27017/ysensor';

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('a user disconnected');
  });
});

MongoClient.connect(mongoUrl, function (err, db) {
  if (err) throw err;
  db.createCollection('yhub', function (err, res) {
    if (err) throw err;
    console.log('Table created!');
    db.close();
  });
});

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('index.ejs');
});

app.post('/', function (req, res) {
  var data = req.body;

  // replace '.' with '_' in key names
  Object.keys(data).forEach(function (key) {
    if (key.indexOf('.') > -1) {
      var newKey = key.replace('.', '_');
      data[newKey] = data[key];
      delete data[key];
    }
  });

  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    db.collection('yhub').insertOne(data, function (err, res) {
      if (err) throw err;
      console.log('Record inserted into db collection');
      io.emit('update chart', data);
      db.close();
    });
  });

  res.send(req.body);
});

app.post('/getData', function (req, res) {
  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    db.collection('yhub').find({"timestamp": {$gte: (new Date).getTime().toString()}}, {"timestamp": 1, "LIGHTMK3-76EB4_lightSensor": 1, "_id": 0}).toArray(function (err, results) {
      if (err) throw err;
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(results));
      db.close();
    });
  });
});

server.listen(3000, function () {
  console.log('listening on *:3000');
});
