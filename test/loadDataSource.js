var assert = require("assert");
var http = require("http");
var request = require("superagent");
var expect = require("expect.js");
var should = require("should")



var loadDataSource = require('../modules/loadDataSource');


describe("loadDataSource", function() {

    describe("#csv", function(){
        it("should convert csv data to json", function(done){    
            optionsCSV = {"path": "test/data/titanicClean.csv"};
            optionsJSON = {"path": "test/data/titanicClean.json"};
            loadDataSource.json(optionsJSON , function(){
                csv = loadDataSource.data;
                loadDataSource.json(optionsJSON, function(){
                    json = loadDataSource.data;
                    (csv).should.be.an.Object;
                    (json).should.be.an.Object;
                    (csv).should.be.eql(json);              
                    done();
                });
            });
        })
    });

})