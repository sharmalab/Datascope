var assert = require("assert");
var http = require("http");
var request = require("superagent");
var expect = require("expect.js");

var main = require("../main.js");

describe("app", function() {

	describe("GET /", function() {


		it("responds with the app", function(done) {
		

			main.init(function(){
				request.get("http://localhost:3000/", function(res){

					expect(res).to.exist;
					expect(res.status).to.equal(200);
					done();	
				})	
			})
		});
	});
	
	describe('GET /data', function(){
		it("responds with a HTTP header containing data", function(done){
			http.get("http://localhost:3000/data/", function(res){

				expect(res).to.exist;
				res.on("data", function(chunk){
					//console.log(chunk.toString())
			
					done();
				})
			})
			//console.log(d);
		})

	});


})