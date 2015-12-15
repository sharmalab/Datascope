/* global dc */
/* global d3 */
/* global queryFilter */

var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");


var SplomGrid = React.createClass({
    componentDidMount: function(){
        var self = this;
        var attributes = this.props.config.attributes;       
        //console.log(self.props.currData);
        
        //var chart = attributes.
        for(var i=0; i<attributes.length; i++){
            var combinedAttribute = attributes[i].attributeName + "-" + attributes[i].attributeName;
            var dim = {
                filter: function(){
                    var attr = attributes[i].attributeName;
                    console.log("weeeey");
                    return function(f){
                        //console.log(f);
                        console.log("wooooooot");
                        queryFilter[attr] = f;
                        AppActions.refresh(queryFilter);
                    };
                }(),
                filterAll: function(){

                },
                name: function(){
                }
            };

            var group = {
                all: function(){
                    var attr = attributes[i].attributeName;
                    return function(){                        
                        //console.log(attr);
                        return self.props.currData[attr].values;
                    };
                }(),
                order: function(){

                }
            };

            var chart = dc.barChart("#"+combinedAttribute);
            chart.width(220)
                .height(200)
                .dimension(dim)
                .group(group)
                .x(d3.scale.linear().domain([0,100]));
            chart.filterHandler(function(dimension, filter){
                //console.log(dimension);
                //var begin = $("#filterBeg"+dimension.name());
                //var end = $("#filterEnd"+dimension.name());
                if(filter.length > 0 && filter.length!=2){
                    filter = filter[0];
                }
                //begin.val(filter[0]);
                //end.val(filter[1]);
                dimension.filter(filter);
                return filter;
            });

        }

        for(var i=0; i<attributes.length; i++) {
            var attribute_row = attributes[i];
            for(var j=i+1; j< attributes.length; j++) {
                var attribute_col = attributes[j];
                //console.log(attribute_row, attribute_col);
                var combinedAttribute = attribute_row.attributeName + "-" + attribute_col.attributeName;
                //console.log(combinedAttribute);
            
                var dim = {
                    filter: function(){
                        var attr = combinedAttribute;
                        return function(f){
                            
                            console.log(f);
                            queryFilter[attr] = [];
                            AppActions.refresh(queryFilter);
                        };

                    }(),
                    filterAll: function(){

                    },
                    name: function(){ 
                    },
                    filterFunction: function(f){
                        f();
                    } 
                };
                var group = {
                    all: function(){
                        var attr = combinedAttribute;
                        return function(){                        
                            //console.log(attr);
                            return self.props.currData[attr].values;
                        };
                    }(),
                    order: function(){
                    }
                };
                var chart = dc.scatterPlot("#"+combinedAttribute);
                chart.width(220)
                    .height(200)
                    .dimension(dim)
                    .group(group)
                    .x(d3.scale.linear().domain([0,100]));
                chart.filterHandler(function(){
                    var dimension = dim;
                    var attr = combinedAttribute;
                    return function(d, filters){
                        console.log(d);
                        console.log(filters);
                        console.log(dimension); 
                        //console.log(filters);
                        if (filters.length === 0) {
                            //return null;
                            dimension.filter([]);
                            return null;
                        } else {
                            dimension.filterFunction(function (d) {
                                //console.log(filters);
                                queryFilter[attr] = {
                                    filters: filters,
                                    type: "2d"
                                };

                                AppActions.refresh(queryFilter);
                                for (var i = 0; i < filters.length; i++) {
                                    var filter = filters[i];
                                    if (filter.isFiltered && filter.isFiltered(d)) {
                                        return true;
                                    } else if (filter <= d && filter >= d) {
                                        return true;
                                    }
                                }
                                return false;
                            });
                        }
                        return filters;
                    };
                }());
                var symbolSize = 5;
                var hiddenSize = 5;
                chart.symbolSize(symbolSize);
                chart.symbolOpacity(0.7);
                chart.hiddenSize(hiddenSize);
                chart.hiddenOpacity(0.8);
                chart.hiddenColor("grey");


                /*
                var combinedAttribute = attribute_row.attributeName + "-" + attribute_col.attributeName;
                console.log(combinedAttribute);
            
                var dim = {
                    filter: function() {

                    },
                    filterAll: function() {


                    },
                    name: function(){
                        //return attributeName;
                    }
                };
                var group = {
                    all: function() {
                        console.log(i, j);
                        console.log(combinedAttribute);
                        return self.props.currData[combinedAttribute].values;
                        //return filteredData["heatMap"].values;
                    },
                    order: function() {
                        //return groups["heatMap"];
                    },
                    top: function() {

                        return self.props.currData[combinedAttribute].values;
                        //return filteredData["heatMap"].values;
                    }
                };
                
                console.log("sup");
                var chart  = dc.scatterPlot("#"+ combinedAttribute);
                chart.width(220)
                    .height(190)
                    .dimension(dim)
                    .group(group)
                    .x(d3.scale.linear().domain([0,100]));
                //return chart;       
                */
            }
        }
 
    },

    render: function(){
        var attributes = this.props.config.attributes;
        var attributes2 = this.props.config.attributes;
        var rows = attributes.map(function(attribute){
     
            var row = attributes2.map(function(attribute_col){
                return(
                        <div className="splom-grid-col" id={attribute.attributeName + "-" + attribute_col.attributeName}> {attribute.attributeName + " " +attribute_col.attributeName} </div>
                );
            });
        

            return <div className="row">{row}</div>;
        });

        return (
                <div>{rows}</div>
        );
    }
});

var GenericSplom = React.createClass({
   /* 
    renderRow: function(attribute){
    },
    */
    render: function(){
        var self = this;
        //var attributes = this.props.config.attributes;
        //attributes;
        //
        /*
        for(var i in attributes){
            //var attribute = attributes[i];
            //console.log(attribute);
        }
        */
        return(

            <div> 
                <SplomGrid config = {self.props.config} currData={self.props.currData}/>
            </div>
        );
    }
});

var Splom = React.createClass({
    componentDidMount: function(){
        
    },
    render: function(){
        var self = this;
        //var attributes = this.props.config.attributes;
        //console.log(self.props.currData);
        return(
            <div className="splom display" id="">
                <h4>SPLOM</h4>
                <GenericSplom config={self.props.config} currData={self.props.currData} />

            </div>
        );
    }
});

module.exports = Splom;
