/* global dc */
/* global d3 */
/* global queryFilter */

var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");


var SplomGrid = React.createClass({
    componentDidMount: function(){
        var self = this;
        var attributes = this.props.config.attributes;       
        //
        
        //var chart = attributes.
        for(var i=0; i<attributes.length; i++){
            var attribute_row = attributes[i];
            var attribute_col = attributes[i];
            var combinedAttribute = attributes[i].attributeName + "-" + attributes[i].attributeName;
            var dim = {
                filter: function(){
                    var attr = attributes[i].attributeName;
                   
                    return function(f){
                  
                 
                        queryFilter[attr] = f;
                        AppActions.refresh(queryFilter);
                    };
                }(),
                filterAll: function(){

                },
                some: function () {
                    var attr = attributes[i].attributeName;
                    return function(f) {
                        queryFilter[attr] = f;
                        AppActions.refresh(queryFilter);
                    };
                },
                name: function(){
                    var attr = attributes[i].attributeName;
                    return function(){
                        return attr;
                    };
                }()
            };

            var group = {
                all: function(){
                    var attr = attributes[i].attributeName;
                    return function(){                        
                       
                        return self.props.currData[attr].values;
                    };
                }(),
                order: function(){

                }
            };
            var domain = [0,100];
            if(attribute_row.domain){
                domain = attribute_row.domain;
            }


            var chart = dc.barChart("#"+combinedAttribute);
            chart.width(230)
                .height(200)
                .dimension(dim)
                .elasticY(true)
                .group(group);
        
            if(attribute_row.continous ){
                chart.x(d3.scale.linear().domain(domain));
                chart.xUnits();
            } else {
                chart.x(d3.scale.ordinal());
                chart.xUnits(dc.units.ordinal);
            }
            
            
             //chart.x(d3.scale.ordinal());
             //chart.xUnits(dc.units.ordinal);
             
            //chart.x(d3.scale.linear().domain(domain));
            /*
			chart.xUnits(function(start,end){
                return ((+end)-(+start));
            });
			*/
            chart.filterHandler(function(dimension, filter){
                /*
                
               
              
                //console.log(filter);
                //console.log(dimension);
                //var begin = $("#filterBeg"+dimension.name());
                //var end = $("#filterEnd"+dimension.name());
                //console.log(filter[0].filterType);
                if(filter.length === 0){
                    console.log("here zeeeor");
                    dimension.filter([]);
                    return null;
                }


                if(filter[0].filterType === "RangedFilter"){
                    console.log("...");
                    dimension.filter(filter[0]);
                    return filter[0];
                } else {
                    

                    
                    if(filter.length > 0 && filter.length!=2){
                        filter = filter[0];
                        dimension.filter([+filter]);
                        return [filter];
                    } 

                }
                console.log(filter);

                //begin.val(filter[0]);
                //end.val(filter[1]);
                //dimension.filter(filter);
                //return filter;
                */

                
               

                if(filter.length > 0){

                    //Dragging and brusshing range filters
                    if(filter[0].filterType){
                        if(filter[0].filterType === "RangedFilter"){
                            dimension.filter(filter[0]);
                            return filter[0];
                        }
                    }
                    else {
                        var filter_arr = [];
                        for(var i in filter){
                            filter_arr.push(+filter[i]);
                        }
                        dimension.filter(filter);
                        
                        return filter;
                    }
                } else {
                    //Remove brush
                    dimension.filter([]);
                    return null;
                }


            });

            
            if(attribute_row.labels){
                chart.ordering(function(d){
                    //console.log(d);
                    //return 1

                    return +d.key;
                });



                chart.xAxis().tickFormat(function(){

                    var xAxisLabels = attribute_row.labels;
                
                    return function(v){

                        /*
                        if(isNaN(+xAxisLabels[v]))
                            return xAxisLabels[v];
                        return +xAxisLabels[+v];
                        */
                        //return v.key;
               
              
             
                        return xAxisLabels[(+v)];
                    }
                }());
            }
            /* 
            if(attribute_col.labels){    
                var yAxisLabels = attribute_col.labels;
                chart.yAxis().tickFormat(function(v){
                    return yAxisLabels[v];
                }); 
            }
            */
           
        }

        for(var i=0; i<attributes.length; i++) {
            var attribute_row = attributes[i];
            for(var j=i+1; j< attributes.length; j++) {
                var attribute_col = attributes[j];
               
                var combinedAttribute = attribute_row.attributeName + "-" + attribute_col.attributeName;
                
            
                var dim = {
                    filter: function(){
                        var attr = combinedAttribute;
                        return function(f){
                            
                            
                            queryFilter[attr] = [];
                            AppActions.refresh(queryFilter);
                        };

                    }(),
                    filterAll: function(){

                    },
                    name: function(){ 
                    },
                    filterFunction: function(){
                        var attr = combinedAttribute;
                        console.log("woot");
                        return function(f){
                            var data = self.props.currData[attr];
                            f(data);
                        };
                    }() 
                };
                var group = {
                    all: function(){
                        var attr = combinedAttribute;
                        return function(){                        
                            
                            return self.props.currData[attr].values;
                        };
                    }(),
                    order: function(){
                    }
                };
                var domain = [0,100];
                if(attribute_row.domain){
                    domain = attribute_row.domain
                }

                var chart = dc.scatterPlot("#"+combinedAttribute);
                chart.width(230)
                    .height(200)
                    .dimension(dim)
                    .group(group)
                    .x(d3.scale.linear().domain(domain));
                chart.filterHandler(function(){
                    var dimension = dim;
                    var attr = combinedAttribute;
            		
                    return function(d, filters){
                       
					
                        console.log(filters); 
                        if(filters.length){
                            if(filters[0].filterType === "RangedTwoDimensionalFilter"){
                                dimension.filterFunction(function(d){
                                    console.log(d);
                                    return function(d){
                                        console.log(d);
                                        queryFilter[attr] = {
                                            filters: filters,
                                            type: "2d"
                                        };
                    
                                        AppActions.refresh(queryFilter);

                                        for (var i = 0; i < filters.length; i++) {
                                            var filter = filters[i];
                                            console.log(filter);
                                            console.log("heeeereeee!!!!");
                                            console.log(filter.isFiltered(d));
                                            if (filter.isFiltered && filter.isFiltered(d)) {
                                                return true;
                                            } else if (filter <= d && filter >= d) {
                                                return true;
                                            }
                                        }
                                        return false;
                                        
                                    };
                                }());
                            }
                        }
                        /* 
                         *
                        if (filters.length === 0) {
                            //return null;
                            console.log("zeoo!"); 
                            dimension.filter([]);
                            return null;
                        } else if (filters.length === 1 && !filters[0].isFiltered) {
                            // single value and not a function-based filter
                            dimension.filterExact(filters[0]);
                        } else if (filters.length === 1 && filters[0].filterType === 'RangedFilter') {
                            // single range-based filter
                            dimension.filterRange(filters[0]);
                        } else {
                            dimension.filterFunction(function (d) {
                 
                                queryFilter[attr] = {
                                    filters: filters,
                                    type: "2d"
                                };
			
                                AppActions.refresh(queryFilter);
									
                                for (var i = 0; i < filters.length; i++) {
                                    var filter = filters[i];
                                    console.log(filter);
									console.log("heeeereeee!!!!");
                                    console.log(filter.isFiltered(d));
                                    if (filter.isFiltered && filter.isFiltered(d)) {
                                        return true;
                                    } else if (filter <= d && filter >= d) {
                                        return true;
                                    }
                                }
                                return false;
								
                            });
                        }
                        //return filters;
					    */
                    };
				
                }());
                var symbolSize = 5;
                var hiddenSize = 5;
                
                chart.symbolSize(symbolSize);
                chart.symbolOpacity(0.7);
                chart.hiddenSize(hiddenSize);
                chart.hiddenOpacity(0.8);
				chart.highlightedSize(6);
                chart.hiddenColor("grey");
                chart.clipPadding(10);
                
                /*
                chart.renderlet(function(chart) {
                    chart.svg().select('.chart-body').attr('clip-path', null)
                });               
                */
 
                if(attribute_row.labels){
                    var xAxisLabels = attribute_row.labels;
                    chart.xAxis().tickFormat(function(){
                        var axisLabels = xAxisLabels;

                        return function(v){


                            return axisLabels[v];
                        };
                    }());
                }
                if(attribute_col.labels){   

                    var yAxisLabels = attribute_col.labels;
                    chart.yAxis().tickFormat(function(){
                        var axisLabels = yAxisLabels;
                        //console.log(axisLabels);
						
                        return function(v){

                        
                            return axisLabels[v];
                        };
                    }());
                    if(attribute_col.domain){
						
						chart.y(d3.scale.linear().domain(attribute_col.domain));
                        //chart.y(d3.scale.linear().domain([attribute_col.domain]));  //Fix clipping
                    }
                    //chart.
                }
                            /*
                var combinedAttribute = attribute_row.attributeName + "-" + attribute_col.attributeName;
                
            
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
        var self = this;
        var attributes = this.props.config.attributes;
        var attributes2 = this.props.config.attributes;
        //var row
        var rows = attributes.map(function(attribute){
            //
            
            return <div className="row"><SplomRow config={self.props.config} rowLabel={attribute.shortLabel} rowId={attribute.attributeName} /></div>;
        });


        rows.unshift(<SplomHeader config = {self.props.config} />);
        return (
                <div>{rows}</div>
        );
    }
});


var SplomBox = React.createClass({
    render: function(){
        var rowId = this.props.rowId;
        var colId = this.props.colId;
        //
        return (
            <div className="splom-grid-box" >
                <div id={rowId + "-" + colId}>
                </div>
            </div>
        );
    }
});

var SplomRow = React.createClass({
    render: function(){
        var attributes = this.props.config.attributes;
        var rowId = this.props.rowId;
        var rowLabel = this.props.rowLabel;
        var cols = [];
        cols.push(<div className="splom-side-title" >{rowLabel}</div>);
        for(var i in attributes){
            //
            var colId = attributes[i].attributeName; 
            var box = <SplomBox rowId={rowId} colId={colId} />;
            cols.push(box);
        }
        /*
        var col = attributes.map(function(attribute) {
            /* 
           
            return(
                <div className="splom-grid-col" id={rowId + "-" + attribute.attributeName}> {rowId} + "-" + {attribute.attributeName} </div>

            );
        
            return <SplomBox rowId={rowId} colId={attribute.attributeName} />;
        });
        */
        return <div>{cols}</div>;
    }
});

var SplomHeader = React.createClass({
    render: function(){
        var attributes = this.props.config.attributes;
        var titles = attributes.map(function(attribute){
            var titleBox = <div className="splom-grid-title" >{attribute.label}</div>
            return titleBox;
        });
        titles.unshift(<div className="splom-side-title" id="splom-spacer"></div>);
        return( <div className="row" id="splom-title">{titles}</div>);
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
            //
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
        //
        return(
            <div className="splom display" id="">
              
                <GenericSplom config={self.props.config} currData={self.props.currData} />

            </div>
        );
    }
});

module.exports = Splom;
