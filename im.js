var express = require('express'),
  app = express.createServer(),
  http = require('http'),
  parse = require('url').parse,
  fs = require('fs'),
  phantom = require('phantom'),
  Canvas = require('canvas'),
  Image = Canvas.Image;

app.get('/im', function (req, res) {
  var original = req.param("i");
  fetchImage(original);
  // fs.readFile(__dirname + '/resize-sucka.jpg', function (err, data) {
  // if (err) throw err;
  //   res.send(new Buffer(data, 'binary'), { 'Content-Type': 'image/jpeg' });
  // });
  
});

app.get('/crop', function(req,res){
  var original = req.param("i");
  var url = parse(original);
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
        console.log('cropping...');
        cropImage(imagedata);
      });  
    }
    res.on('error', function(e) {
      console.log("****Errors*****: " + e.message);
    });
  });
});

app.post('/im', function (req, res) {
  var original = req.param("i");
  fetchImage(original);
  res.send("Fetched & Resize");
});

app.get('/pdf', function(req, res) {
   var address = req.param("url");
   console.log(address);
   phantom.create(function (ph){
     ph.createPage(function(page){
       page.set('viewportSize', {width:1000,height:1000});
       page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address');
        } else {
            console.log('Trying to render');
            setTimeout(function () {
               page.render('test.pdf', function(status){
                 console.log('Done rendering');
                 page.release();
                 ph.exit();
               });
            }, 300);
        }
       });    
     });
   });
});

function fetchImage(url){
  var url = parse(url);
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

function cropImage(imagedata){
  var image = new Image,
      start = new Date;
      image.onload = function(){
      console.log('image on load...');
      var w = image.width / 2,
      h = image.height / 2,
      canvas = new Canvas(w, h),
      ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, w, h, 0, 0, w, h);
      console.log('cropped...');
      canvas.toBuffer(function(err, buf){
         fs.writeFile(__dirname + '/crop-sucka.jpg', buf, function(){
           console.log('Cropped and saved in %dms', new Date - start);
         });
        });
      }
      console.log('image loaded...');
      image.src = new Buffer(imagedata, 'binary');  
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
