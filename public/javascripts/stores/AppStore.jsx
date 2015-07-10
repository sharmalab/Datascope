var Reflux = require('reflux');

var AppActions = require('../actions/AppActions.jsx');

var _currentData = {};

var AppStore = Reflux.createStore({

	init: function(){
		console.log("sdfasdf");
		this.listenTo(AppActions.refresh, this.onRefresh);
	},
	onRefresh: function(queryFilter){
		console.log("refreshing.....");
		var filteredData = {};
		var that = this;
	    if(JSON.stringify(queryFilter)) {
	        for (var qf in queryFilter) {
	            if(queryFilter[qf].length === 0) {
	                delete queryFilter[qf];
	            }
	        }
	        d3.json("/data?filter="+JSON.stringify(queryFilter), function (d) {
	            filteredData = d;
	            console.log(filteredData);
	            _currentData = filteredData;

	            /*
	            if(dataTable.ajax){  
	                dataTable.ajax.reload(); //jquery datatable fix
	            }
	            */
	            //dc.renderAll(); //refresh dc charts
	            that.trigger(_currentData); //Trigger the event and pass current state of data
		 
	        });
	        } else {
	            
	        }
		//_currentData = filteredData;
		

	},
	getData: function(){
		return _currentData;
	}

});

module.exports = AppStore;