var should = require("should");

var http = require("http");
var request = require("superagent");
var expect = require("expect.js");

var dataSource = require("../modules/dataSource");

describe("dataSource", function() {

    describe("init", function() {


        it("Reads the config files and processes it", function() {
            dataSource.init("./examples/titanicTable/config/dataSource.json");
            var expected_attrbiutes = { 
              PassengerId: true,
              Survived: true,
              Pclass: true,
              Name: true,
              Sex: true,
              Age: true,
              SibSp: true,
              Parch: true,
              Ticket: true,
              Fare: true,
              Cabin: true,
              Embarked: true 
            };
            

            (JSON.stringify(dataSource.getAttributes())).should.be.exactly(JSON.stringify(expected_attrbiutes));
      
        }); 
    }); 
});