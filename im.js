var express = require('express'),
  app = express.createServer(),
  http = require('http'),
  parse = require('url').parse,
  fs = require('fs'),
  Canvas = require('canvas'),
  Image = Canvas.Image;

app.get('/im', function (req, res) {
  var original = req.param("i");
  fetchImage(original);
  fs.readFile(__dirname + '/resize-sucka4.jpg', function (err, data) {
  if (err) throw err;
    res.send(new Buffer(data, 'binary'), { 'Content-Type': 'image/jpeg' });
  });
  
});

app.post('/im', function (req, res) {
  var original = req.param("i");
  fetchImage(original);
  res.send("Fetched & Resize");
});

function fetchImage(url){
  var url = parse(url);
  console.log(url);
  http.get({
        path: url.pathname,
        host: url.hostname
      }, 
  function(res){
    if (res.statusCode == 200){
      var imagedata = '';
      res.setEncoding('binary');
      res.on('data', function(chunk){
        imagedata += chunk;
      });
      res.on('end', function(){
        processImage(imagedata);
      });  
    }
    res.on('error', function(e) {
      console.log("****Errors*****: " + e.message);
    });
  });
}

function processImage(imagedata){
  var image = new Image,
      start = new Date;
      image.onload = function(){
      var width = image.width / 2,
      height = image.height / 2,
      canvas = new Canvas(width, height),
      ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBuffer(function(err, buf){
         fs.writeFile(__dirname + '/resize-sucka4.jpg', buf, function(){
           console.log('Resized and saved in %dms', new Date - start);
         });
        });
      }
      console.log('processImage - load src');
      image.src = new Buffer(imagedata, 'binary');  
}

app.use(express.errorHandler({ showStack: true }));

app.listen(8081);

console.log("I am listening...don't screw it up");   
//localhost:8081/im?i=http://www.nasa.gov/images/content/440719main_SeaIce_2010_V15_STILL.jpg