var should = require("should");

var http = require("http");
var request = require("superagent");
var expect = require("expect.js");

var dataDescription = require("../modules/dataDescription");

describe("dataDescription", function() {

    describe("init", function() {


        it("Reads the config files and processes it", function() {
            dataDescription.init("./examples/titanicTable/config/dataDescription.json");
            var expectedVisual = [ { name: 'PassengerId',
              datatype: 'integer',
              dataProvider: 'source1',
              attributeType: [ 'visual' ] },
            { name: 'Survived',
              datatype: 'integer',
              dataProvider: 'source1',
              attributeType: [ 'filtering', 'visual' ] },
            { name: 'Pclass',
              datatype: 'integer',
              dataProvider: 'source1',
              attributeType: [ 'visual', 'filtering' ] },
            { name: 'Name',
              datatype: 'string',
              attributeType: [ 'visual', 'filtering' ],
              dataProvider: 'source1' },
            { name: 'Sex',
              datatype: 'string',
              attributeType: [ 'visual', 'filtering' ],
              dataProvider: 'source1' },
            { name: 'Age',
              datatype: 'integer',
              attributeType: [ 'visual', 'filtering' ],
              dataProvider: 'source1' } 
            ];
            var expectedFiltering = [ { name: 'Survived',
              datatype: 'integer',
              dataProvider: 'source1',
              attributeType: [ 'filtering', 'visual' ] },
            { name: 'Pclass',
              datatype: 'integer',
              dataProvider: 'source1',
              attributeType: [ 'visual', 'filtering' ] },
            { name: 'Name',
              datatype: 'string',
              attributeType: [ 'visual', 'filtering' ],
              dataProvider: 'source1' },
            { name: 'Sex',
              datatype: 'string',
              attributeType: [ 'visual', 'filtering' ],
              dataProvider: 'source1' },
            { name: 'Age',
              datatype: 'integer',
              attributeType: [ 'visual', 'filtering' ],
              dataProvider: 'source1' }
            ];


            (JSON.stringify(dataDescription.getVisualAttributes())).should.be.exactly(JSON.stringify(expectedVisual));
            (JSON.stringify(dataDescription.getFilteringAttributes())).should.be.exactly(JSON.stringify(expectedFiltering));
            (dataDescription.getDataType("Sex")).should.be.exactly("string");
        }); 
    }); 
});