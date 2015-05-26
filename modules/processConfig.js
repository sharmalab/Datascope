//JSON Schema validation
var Validator = require('jsonschema').Validator;
var schemaValidator = new Validator();
var fs = require("fs");

//
//### schemaValidation()
//Validates all the configuration files against their
//


exports.validate = function (){
  var dataDescription = JSON.parse(fs.readFileSync("./public/config/dataDescription.json"));
  var interactiveFilters = JSON.parse(fs.readFileSync("./public/config/interactiveFilters.json"));
  var dataSource = JSON.parse(fs.readFileSync("./public/config/dataSource.json"));

  var dataDescriptionSchema = JSON.parse(fs.readFileSync("./schemas/dataDescriptionSchema.json"));
  var interactiveFiltersSchema = JSON.parse(fs.readFileSync("./schemas/interactiveFiltersSchema.json"));
  var dataSourceSchema = JSON.parse(fs.readFileSync("./schemas/dataSourceSchema.json"));


  var res1 = schemaValidator.validate(dataSource, dataSourceSchema);
  //console.log(res3);
  var res2 = schemaValidator.validate(dataDescription, dataDescriptionSchema);
  //console.log(res1);
  var res3 = schemaValidator.validate(interactiveFilters, interactiveFiltersSchema);
  //console.log(res2);

  console.log("validating against schemas")

  if(res1.errors.length == 0){}
  else{

      console.log(res1.errors)
      process.exit()
  }
  if(res2.errors.length == 0){}
  else{ 
      console.log(res2.errors)
      process.exit()
  }
  if(res3.errors.length == 0){}
  else{

    console.log(res3.errors)
    process.exit();
  }
  console.log("Valid config files")

  exports.dataDescription = dataDescription;
  exports.interactiveFilters = interactiveFilters;
  exports.dataSource = dataSource;

};