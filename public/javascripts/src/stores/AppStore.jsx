var Reflux = require('reflux');

var AppActions = require('../actions/AppActions.jsx');

var _currentData = {};

function transform(data) {
  return data;
}

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
      });

	  this.listenTo(AppActions.refresh, this.onRefresh);
	},
    decodeData: function(data){
      var dataDescription = this.dataDescription;
      for(var i in dataDescription){
        var attribute = dataDescription[i].attributeName;
        var dataDictionary = dataDescription[i].dictionary;

        if(dataDictionary){
          //console.log(data[attribute]);
          if(data[attribute]){
            var attributeData = data[attribute].values;
            for(var d in attributeData){
              console.log(attributeData[d]);
              if(dataDictionary[attributeData[d]["key"]]){
                attributeData[d]["key"] = dataDictionary[attributeData[d]["key"]];
              }
            }

          }
        }
      }
      console.log(data);
      return data;
    },
	onRefresh: function(queryFilter){
		var filteredData = {};
		var that = this;
	    var dataDescription = this.dataDescription;
        if(JSON.stringify(queryFilter)) {
	        for (var qf in queryFilter) {

                
                console.log(dataDescription);
                for(var dd in dataDescription){
                  var attr = dataDescription[dd];
                  var attrName = dataDescription[dd].attributeName;
                  var dictionary = attr.dictionary;
                  console.log(dictionary);
                  if(dictionary){
                    console.log(attrName);
                    console.log(qf);
                    if(attrName == qf){
                      var filters = queryFilter[qf];
                      var encodedFilters = [];
                      console.log(filters);
                      for(var f in filters){
                        var filter = filters[f];
                        for(var d in dictionary){
                          var dictionary_entry = dictionary[d];
                          console.log(d);
                          console.log("dict entry: ");
                          console.log(dictionary_entry);
                          if(dictionary_entry == filter){
                            filter = d;
                            console.log(filter);
                            encodedFilters.push(filter);
                          }
                          console.log(dictionary_entry);
                        }
                      }
                      console.log(queryFilter[qf]);
                      queryFilter[qf] = encodedFilters;
                    } 
                  }
                }
	        
  	            if(queryFilter[qf].length === 0) {
	                delete queryFilter[qf];
	            }
            }


            //encode {queryFilter} using data dictionary
	        d3.json("data/?filter="+JSON.stringify(queryFilter) + "&dataSourceName=" + globalDataSourceName, function (d) {
	            filteredData = d;
	            _currentData = filteredData;
                console.log(that);

                _currentData = that.decodeData(_currentData);
                //that.state.currentData = _currentData;
	            that.trigger(_currentData); //Trigger the event and pass current state of data

	        });
	        } else {
	            
	        }
	},
	getData: function(){
        return _currentData;
		//return this.state.currentData;
	}

});

module.exports = AppStore;
