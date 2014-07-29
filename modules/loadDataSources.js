var fs = require('fs');

//
//## json(path, callback)
// - **options**: specifies the file path
// - **callback**: the callback function

function json(options, callback){

      var path = options.path;
      //Read the file using filepath
      fs.readFile(path, 'utf8', function(err, d){
        if(err){
          console.log("Error: "+ err);
          return;
        }
        data = JSON.parse(d);
        
        //Send data back to app.js
      	exports.data = data;
      	callback();
      });
}

//
//## csv(path, callback)
// - **options**: specifies the file path
// - **callback**: the callback function
function csv(options, callback){
      var path = options.path;
      fs.readFile(path, 'utf8', function(err,d){
        data = d;
        data = data.toString().replace(/\r/g,"").split("\n");
        var header = data[0].split(",");
        data = data.slice(1).map(function(d){
          var line = {};
          d.split(",").forEach(function(d,i){
            line[header[i]] = d;
          });
          return line;
        });    
        exports.data = data;
        callback();
      });
}

//## rest_json(options, callback)
// - **options**: HTTP header options
// - **callback**: the callback function
function rest_json(options, callback){
    var options = options;
    //Make the HTTP GET request
    http.get(options, function(response){
        response.on('data',function(chunk){
            if(chunk){
                data += chunk;
            }
        });

        response.on('end', function(){
        	exports.data = JSON.parse(data);
        	callback();
        })
    });
}

//## rest_csv(options, callback)
// - **options**: HTTP header options
// - **callback**: the callback function
function rest_csv(options, callback){
      http.get(options, function(response){
        response.on('data', function(chunk){
          chunk = chunk.toString();
          if(chunk){
            data+=chunk;
          }
        });
        response.on('end', function(){
          exports.data=JSON.parse(data);
          callback();          
        })

      })
}

exports.json = json;
exports.csv = csv;
exports.rest_json = rest_json;
exports.rest_csv = rest_csv;