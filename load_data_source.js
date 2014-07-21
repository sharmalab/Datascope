var fs = require('fs');

function json(path, data, callback){
      fs.readFile(path, 'utf8', function(err, d){
        if(err){
          console.log("Error: "+ err);
          return;
        }
        data = JSON.parse(d);
        
        //process_backend_schema();
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

function rest_json(path, data, options, callback){
    var options = options;
    http.get(options, function(response){
        response.on('data',function(chunk){
            if(chunk){
                data += chunk;
                        //console.log(data);
            }
            //process_backend_schema();
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