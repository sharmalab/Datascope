var Validator = require('jsonschema').Validator;
var v = new Validator()
var fs = require("fs");
var data_description = JSON.parse(fs.readFileSync("public/schemas/dataDescription.json"));
var interactive_filters = JSON.parse(fs.readFileSync("public/schemas/interactiveFilters.json"));
var data_source = JSON.parse(fs.readFileSync("public/schemas/dataSource.json"))

var data_description_schema = JSON.parse(fs.readFileSync("schemas/dataDescriptionSchema.json"));
var interactive_filters_schema = JSON.parse(fs.readFileSync("schemas/interactiveFiltersSchema.json"));
var data_source_schema = JSON.parse(fs.readFileSync("schemas/dataSourceSchema.json"));

var res1 = v.validate(data_description, data_description_schema);
var res2 = v.validate(interactive_filters, interactive_filters_schema);
var res3 = v.validate(data_source, data_source_schema);


if(res1.errors.length == 0)
	console.log("data_description_schema passed");
else
	console.log(res1.errors)
if(res2.errors.length == 0)
	console.log("interactive_filters_schema passed");
else 
	console.log(res2.errors)
if(res3.errors.length == 0)
	console.log("data_source_schema passed"); 
else
	console.log(res3.errors)