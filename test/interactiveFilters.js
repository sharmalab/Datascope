var should = require("should");

var http = require("http");
var request = require("superagent");
var expect = require("expect.js");


describe("interactive Filters", function() {

  describe("crossfilter groups ", function() {
    var dataSource, interactiveFilters, dataDescription, ds;

    it("should load correctly through require", function(done){
      dataSource = require("../modules/dataSource");
      interactiveFilters = require(
        "../modules/interactiveFilters");
      dataDescription = require("../modules/dataDescription");
      done()
    });

    it("should init correctly", function(done){
      dataDescription.init(
        "./examples/newDataSourceConfig/config/dataDescription.json"
      );
      ds = dataSource.init(
        "./examples/newDataSourceConfig/config/dataSource.json");
      interactiveFilters.init(
        "./examples/newDataSourceConfig/config/interactiveFilters.json"
      )
      done()
    });

    it("should work on dummy data", function(done) {
      dataSource.loadData(function(data) {

        //console.log(data);
        interactiveFilters.applyCrossfilter(data);
        var truth = [
          [{
              key: '2',
              value: 1
            },
            {
              key: '3',
              value: 1
            },
            {
              key: '4',
              value: 1
            },
            {
              key: '1',
              value: 1
            }
          ],
          [{
              key: 'dfg',
              value: 1
            },
            {
              key: 'qwe',
              value: 1
            },
            {
              key: 'zxc',
              value: 1
            },
            {
              key: 'asd',
              value: 1
            }
          ],
          [{
              key: 'banana',
              value: 1
            },
            {
              key: 'mango',
              value: 1
            },
            {
              key: 'orange',
              value: 1
            },
            {
              key: 'apple',
              value: 1
            }
          ],
          [{
              key: '12',
              value: 1
            },
            {
              key: '20',
              value: 1
            },
            {
              key: '3',
              value: 1
            },
            {
              key: '10',
              value: 1
            }
          ]
        ];

        var groups = interactiveFilters.getGroups();

        var results = []
        for (var g in groups) {
          var group = groups[g];
          results.push(group.top(Infinity));
          //console.log(group.top(Infinity));
        }
        //console.log(results)
        results.should.be.eql(truth)
        //console.log("results...")
        //console.log(results)
        //console.log(results)
        //(results).should.be.eql(truth);
        //console.log(interactiveFilters.getGroups()["A"].top(Infinity));
      });
      done();
    });
  });
});
