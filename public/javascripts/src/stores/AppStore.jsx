/* global d3 */
/* global globalDataSourceName */
var Reflux = require('reflux');

var AppActions = require('../actions/AppActions.jsx');

var _currentData = {};


var Decoder = class Decoder {
  constructor(dataDescription){
    //convert dataDescription.json file to decoder datastructure.
  
    var D = {};
    for(var i=0; i<dataDescription.length; i++){
      var d = dataDescription[i];
      var attr = d.attributeName;
      if(d.dictionary){
        D[attr] = {};
        console.log(d.dictionary);
        var dictionary = d.dictionary;
        for(var j in dictionary){
          if(dictionary.hasOwnProperty(j)){
            D[attr][j] = dictionary[j];
          }
        }
      }
    }
    this.decoder = D;

  }

  decode(data){
    var decoder = this.decoder;
    for(var i in decoder){
      if(!decoder.hasOwnProperty(i)){
        continue;
      }
      var dictionary = decoder[i];

      if(data[i]){
        var attributeData = data[i].values;
        for(var d in attributeData){
          if(!attributeData.hasOwnProperty(d)){
            continue;
          }

          if(dictionary[attributeData[d].key]){
            attributeData[d].key = dictionary[attributeData[d].key];     
          }
        }
        data[i].values = attributeData;
      }   

    }
    return data;  
  }
};

var Encoder = class Encoder {
  constructor(dataDescription){
    //convert dataDescription.json to encoder datastructure.
    var E = {};
    for(var  i=0; i<dataDescription.length; i++){
      var d = dataDescription[i];
      var attr = d.attributeName;
      if(d.dictionary){
        E[attr] = {};
        var dictionary = d.dictionary;
        for(var j in dictionary){
          if(dictionary.hasOwnProperty(j)){
            E[attr][dictionary[j]] = j;
          }
        }
      }
    }
    this.encoder = E;
  }

  encode(queryFilter) {
    var encoder = this.encoder;
    for(var key in queryFilter){
      if(queryFilter.hasOwnProperty(key)){
           console.log(queryFilter);
           console.log(key);
           var qf = queryFilter[key];
           if(encoder[key]){ //encoding exists for key?
              var e = encoder[key];
              var encodedQf = [];
              for(var i=0; i<qf.length; i++){
                if(e[qf[i]]){
                  encodedQf.push(e[qf[i]]);
                } else {
                  encodedQf.push(qf[i]);
                }
              }
              qf = encodedQf;
              queryFilter[key] = qf;
           }
      }
    }
    return queryFilter;
  }
};


var AppStore = Reflux.createStore({
    getInitialState: function(){

      return {};
    },
	init: function(){
      var self = this;
      d3.json("/config/dataDescription", function(data){
        console.log("getting data description");
        console.log(data);
        self.dataDescription = data;
        self.encoder = new Encoder(data);
        self.decoder = new Decoder(data);
      });

	  this.listenTo(AppActions.refresh, this.onRefresh);
	},
    decodeData: function(data){
      //var dataDescription = this.dataDescription;
      var decoder = this.decoder;
      var decodedData = decoder.decode(data);

      return decodedData;
    },
	onRefresh: function(queryFilter){
		var filteredData = {};
		var that = this;
        var encoder = this.encoder;
        queryFilter = encoder.encode(queryFilter);
        d3.json("data/?filter="+JSON.stringify(queryFilter) + "&dataSourceName=" + globalDataSourceName, function (d) {
            filteredData = d;
            _currentData = filteredData;
            console.log(that);

            _currentData = that.decodeData(_currentData);
            //that.state.currentData = _currentData;
            that.trigger(_currentData); //Trigger the event and pass current state of data

        });

	},
	getData: function(){
        return _currentData;
		//return this.state.currentData;
	}

});

module.exports = AppStore;
