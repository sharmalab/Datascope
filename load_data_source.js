var fs = require('fs');

//
//## json(path, data, callback)
// - **path**: specifies the file path
// - **data**: 
// - **callback**: the callback function

function json(path, data, callback){
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


function csv(path, data, callback){
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

//## rest_json(path, data, options, callback)
// - **path**: specifies the file path
// - **data**: 
// - **options**: HTTP header options
// - **callback**: the callback function
function rest_json(path, data, options, callback){
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

function rest_csv(path, data, options, callback){
      http.get(options, function(response){
        response.on('data', function(chunk){
          chunk = chunk.toString()
          //console.log(chunk.toString())
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