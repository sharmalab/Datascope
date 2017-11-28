/* global d3 */
/* global globalDataSourceName */
var Reflux = require('reflux');

var AppActions = require('../actions/AppActions.jsx');

var _currentData = {};

var Encoder = require('./Encoder.js');
var Decoder = require('./Decoder.js');

var AppStore = Reflux.createStore({
    getInitialState: function(){

      return {};
    },
	init: function(){
      var self = this;
      d3.json("config/dataDescription", function(data){
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
		for (var qf in queryFilter) {
			if(queryFilter[qf].length === 0) {
				delete queryFilter[qf];
			}
		}
        //queryFilter = encodeURI(queryFilter);
        console.log("query filter:");
        console.log(queryFilter);
        d3.json("druid/filter?filter="+JSON.stringify(queryFilter) + "&dataSourceName=" + globalDataSourceName, function (d) {
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
