var assert = require("assert");
var http = require("http");
var request = require("superagent");
var expect = require("expect.js");

var main = require("../main.js");

describe("app", function() {

	describe("GET /", function() {


		it("responds with the app", function(done) {
			console.log("app get/")
			//this.timeout(10000);
			main.init(function(){
				request.get("http://localhost:3000/", function(res){

					expect(res).to.exist;
					expect(res.status).to.equal(200);
					console.log("get done");
					done();	
				})	
			})
		});
	});
	
	describe('GET /data', function(){
		it("responds with a HTTP header containing data", function(done){
			console.log("app get /data")
			http.get("http://localhost:3000/data/", function(res){

				expect(res).to.exist;
				expect(res.status).to.equal(200);
				res.on("data", function(chunk){
					//console.log(chunk.toString())
			
				});
				res.on("end", function(){

					console.log("get done");
					done();
				})
			})
			//console.log(d);
		})

	});


})