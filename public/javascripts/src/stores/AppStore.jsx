var Reflux = require('reflux');

var AppActions = require('../actions/AppActions.jsx');

var _currentData = {};

var AppStore = Reflux.createStore({

	init: function(){
		this.listenTo(AppActions.refresh, this.onRefresh);
	},
	onRefresh: function(queryFilter){
		var filteredData = {};
		var that = this;
	    if(JSON.stringify(queryFilter)) {
	        for (var qf in queryFilter) {
	            if(queryFilter[qf].length === 0) {
	                delete queryFilter[qf];
	            }
	        }

	        d3.json("data/?filter="+JSON.stringify(queryFilter) + "&dataSourceName=" + globalDataSourceName,
					function (d) {
	            filteredData = d;
	            _currentData = filteredData;

	            that.trigger(_currentData); //Trigger the event and pass current state of data
	        });
	        } else {
	            
	        }
	},
	getData: function(){
		return _currentData;
	}

});

module.exports = AppStore;
