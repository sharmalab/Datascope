var Reflux = require('reflux');

var AppActions = require('../actions/AppActions');

var _currentData = {};

var AppStore = Reflux.createStore({

	init: function(){
		this.listenTo(AppActions.refresh, this.onRefresh);
	},
	onRefresh: function(queryString){
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

	            /*
	            if(dataTable.ajax){  
	                dataTable.ajax.reload(); //jquery datatable fix
	            }
	            */
	            //dc.renderAll(); //refresh dc charts
	            this.trigger(_currentData); //Trigger the event and pass current state of data
	        });
	        } else {
	            
	        }
		//_currentData = filteredData;
		

	}
});

modules.exports = AppStore;
