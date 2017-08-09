var should = require("should");

var http = require("http");
var request = require("superagent");
var expect = require("expect.js");


describe("dataSource", function() {
/*
    describe("init", function() {


        it("Reads the config files and processes it", function() {

            var dataSource = require("../modules/dataSource");
            console.log("dataSource")
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

*/
    describe("join", function(){
      /*
      it("should return the join of multiple data sources", function(done){

        var dataSource = require("../modules/dataSource");
        var ds = dataSource.init("./examples/joinDemo/config/dataSource.json");
        //console.log(ds);  
        dataSource.loadData(function(data){
          console.log("...")
          console.log(data);
          done();
        });

      });

      it("should work on tcia data", function(done){
        var dataSource = require ("../modules/dataSource");
        var ds = dataSource.init("./examples/joinDemo/config/dataSource.json");
        dataSource.loadData(function(data){

        })
      })
      /*
      it("should work on TCIA data", function(done){

        var dataSource = require("../modules/dataSource");
        var ds = dataSource.init("./examples/joinDemo/config/dataSource.json");
        //console.log(ds);  
        dataSource.loadData(function(data){
          console.log("...")
z          console.log(data);
          done();
        });

      });
    */
    
      it("should work on single source dummy data", function(done){

        var dataSource = require("../modules/dataSource");
        var ds = dataSource.init("./examples/newDataSourceConfig/config/dataSource2.json");
        //console.log(ds);
        dataSource.loadData(function(data){
          //console.log(data);
          var truth = [
            {
              "A":"1",
              "B":"asd",
              "C":"apple",
              "D":"20"
            },
            {
              "A":"2",
              "B":"zxc",
              "C":"orange",
              "D":"10"
            },
            {
              "A":"3",
              "B":"qwe",
              "C":"banana",
              "D":"3"
            },
            {
              "A":"4",
              "B":"dfg",
              "C":"mango",
              "D":"12"
            }
          ];
          (data).should.be.eql(truth);

          done();
        })

      });
      

      it("should work on multi source dummy data", function(done){

        var dataSource = require("../modules/dataSource");
        var ds = dataSource.init("./examples/newDataSourceConfig/config/dataSource.json");
        //console.log(ds);
        //console.log("multi")
        dataSource.loadData(function(data){
          //console.log("...")

          //console.log(data);

          var truth = [
            {
              "A":"1",
              "B":"asd",
              "C":"apple",
              "D":"20"
            },
            {
              "A":"2",
              "B":"zxc",
              "C":"orange",
              "D":"10"
            },
            {
              "A":"3",
              "B":"qwe",
              "C":"banana",
              "D":"3"
            },
            {
              "A":"4",
              "B":"dfg",
              "C":"mango",
              "D":"12"
            }
          ];
          (data).should.be.eql(truth);

          done();
        })

      });
      /*
      it("should work on tcia data", function(done){
        this.timeout(10000);
        var dataSource = require ("../modules/dataSource");
        var anyToJSON = require("anytojson");
        var ds = dataSource.init("./examples/TCIAJoin2/config/dataSource.json");
        
        //var dataSource2 = require("../modules/dataSource");
        //var d2 = dataSource2.init("./examples/TCIAJoin2/config/dataSource2.json");

        //d1.init("./examples/TCIAJoin2/config/dataSource.json");
        //d2.init("./examples/TCIAJoin2/config/dataSource2.json");

        dataSource.loadData(function(data){
            console.log(data.length);
            var opt = {"path": "./examples/TCIAJoin2/data/CombinedData.csv"};
            anyToJSON.csv(opt, function(data2){
              console.log(data2.length)
              done();
            })
            
        });
        
        /*
          dataSource2.loadData(function(data2){
            console.log(data2.length)
            done();  
          })
      
      })

    }); 
        */
    });
});
