var http = require("http");
var st = require("st");
var Router = require("routes-router");

var send2s3 = require("./lib/send2s3.js");
var MultipartyForm = require("./lib/multipart-form.js");

var app = Router()
var port = 8080;

var staticHandler = st({
  path: __dirname,
  index: 'index.html',
  cache: false
});

app.addRoute("*", function(req, res) {
  staticHandler(req, res);
})

app.addRoute("/upload", function (req, res, opts, cb) {
  MultipartyForm(req, res, {
    handlePart: function(part) {
      send2s3(part, 'DEMO/', function(err, filename) {
        if (err) console.log(err);
        // filetracker.addFile(filename);
      });
    }
  }, function (err, values) {
    if (err) {
      console.log('error in multipart form', err);
    }
    console.log('File uploaded succesfully');
  });
});

var server = http.createServer(app);
server.listen(port);

console.log("Server listening on port: ", port);