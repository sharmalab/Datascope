var assert = require("assert");
var http = require("http");
var request = require("superagent");
var expect = require("expect.js");
describe("app", function() {

	describe("GET /", function() {
		it("responds with the app", function() {
			request.get("http://localhost:3000/", function(res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
			})
		});
	});
	
	describe('GET /data', function(){
		it("responds with a HTTP header containing data", function(){
			http.get("http://localhost:3000/data", function(res){
				expect(res).to.exist;
				expect(res.status).to.equal(200)
			})
			//console.log(d);
		})

	});


})