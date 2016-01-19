/* global d3 */
/* global $ */
/* global dc */
/* global queryFilter */

//var queryFilter = {};
var AppActions = require("../actions/AppActions.jsx");
var React = require("react");




var ChartAddons = React.createClass({
    getInitialState: function(){
        return {elasticY: true, elasticX: true};
    },
    filter: function(e){
        var self = this;
        var c = self.props.chart;
        if(e.keyCode == 13){
            //console.log(this.props.chart);
            var f = [self.state.beg, self.state.end];
            c.filterAll();
            c.filter(f);
        }

    },
    handleBeg: function(event){
        this.setState({beg: event.target.value});
    },
    handleEnd: function(event){
        this.setState({end: event.target.value});
    },

    handleElasticX: function(){
        var c = this.props.chart;
        //console.log("handle checkbox..");
        //console.log((this.state.elasticY));
        //var queryFilterBackup = queryFilter;
        //c.elasticY(true);
        //AppActions.refresh({});
        //console.log(queryFilter);

        if(this.state.elasticX === true){

            c.elasticX(false);

        } else {
            //Elastic axis
            c.elasticX(true);
        }
        //AppActions.refresh(queryFilter);

        //c.elasticY(false);
        c.filterAll();
        dc.renderAll();
        this.setState({elasticX: !this.state.elasticX});

    },
    handleElasticY: function(){
        var c = this.props.chart;
        //console.log("handle checkbox..");
        //console.log((this.state.elasticY));
        //var queryFilterBackup = queryFilter;
        //c.elasticY(true);
        //AppActions.refresh({});

        //console.log(queryFilter);

        if(this.state.elasticY === true){

            c.elasticY(false);

        } else {
            //Elastic axis
            c.elasticY(true);
        }
        //AppActions.refresh(queryFilter);

        //c.elasticY(false);
        c.filterAll();
        dc.renderAll();
        this.setState({elasticY: !this.state.elasticY});

    },
    handleInvertSelection: function(event) {
        console.log(this.props.config.attributeName);
        var attributeName = this.props.config.attributeName;
        var c = this.props.chart;
        var availableFilters = (this.props.data[attributeName].values);
        var currentFilter = queryFilter[attributeName];
        console.log("current filter");
        console.log(currentFilter);
        var invertedFilter = [];
        for(var i in availableFilters){
            var filter = availableFilters[i].key;
            var flag = true;
            for(var j in currentFilter){
                if(filter === currentFilter[j])
                    flag = false;
            }
            if(flag)
                invertedFilter.push(filter);
            /*
            //console.log(filter.key +" " + currentFilter);
            if(currentFilter != filter.key){
                //console.log('false');
                invertedFilter.push(filter.key)
            }
            */
        }
        console.log(invertedFilter);
        c.filter(null);
        c.filter(invertedFilter);
        ////c.filter({invert: invertedFilter});
        console.log("filtered! woot");
    },
    render: function(){
        var visType = this.props.config.visualization.visType;
        var isFilterActive = this.props.isFilterActive; 
        console.log(isFilterActive);
        switch(visType){
        case  "barChart":
            return(
                    <div>
                    <div className="chartAddons">
                        <label>
                        Range:
                        <input type="text" onChange={this.handleBeg} onKeyDown={this.filter} id={"filterBeg"+this.props.config.attributeName}/>
                        -
                        <input type="text" onChange={this.handleEnd} onKeyDown={this.filter} id={"filterEnd"+this.props.config.attributeName}/>
                        </label>
                    </div>
                    <div className="chartAddons">
                        <label>
                        ElasticY:
                        <input type="checkbox"  onChange={this.handleElasticY}  checked={this.state.elasticY}/>
                        </label>
                    </div>
                    </div>
                );
        case "rowChart":
            return(
                    <div className="chartAddons">

                        <label>
                        ElasticX:
                        <input type="checkbox" onChange={this.handleElasticX} checked={this.state.elasticX}/>
                        </label>
                        <br />
                        {isFilterActive ?
                        
                        <button onClick={this.handleInvertSelection}>Invert Selection</button>
                        :
                            <div />
                        }
                        
                   </div>
                );
        default:
            return(
                    <div></div>
                );
        }

    }
});


var FilteringAttribute = React.createClass({
    getInitialState: function() {
        return {showChart: true};
    },
    componentWillMount: function(){
     //Initialize crossfilter dimensions and groups before rendering
        var self = this;
        var attributeName = this.props.config.attributeName;

        var dim = {
            filter: function(f) {
                //console.log(f);
                if(f) {

                    queryFilter[attributeName] = f;
                        //refresh()
                    AppActions.refresh(queryFilter);
                } else {
                    if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];
                    //here would call the update action
                    //refresh();
                        AppActions.refresh(queryFilter);
                    } else {
                        return {};
                    }
                }
            },
            filterAll: function() {
                delete queryFilter[attributeName];
                AppActions.refresh(queryFilter);
            },
            name: function(){
                return attributeName;
            }

        };
        var group = {
            all: function() {
                //console.log(AppStore.getData())
                //return self.props.currData;
                return self.props.currData[attributeName].values;
                /*
                if(AppStore.getData()[attributeName]){
                    return AppStore.getData()[attributeName].values;
                }

                return filteredData[attributeName].values;
                */
            },
            order: function() {
                //return groups[attributeName];
            },
            top: function() {
                return self.props.currData[attributeName].values;
                /*
                if(AppStore.getData()[attributeName]){
                    return AppStore.getData()[attributeName].values;
                }

                //console.log(AppStore.getData())
                //return AppStore.getData()[attributeName].values;
                return filteredData[attributeName].values;
                */
            }

        };


        if(attributeName == "ageCancer"){
            dim = {
                filter: function(f){
                    //console.log("filtering", f);
                    //console.log(arguments.toString());
                },
                filterAll: function(){
                 
                },
                name: function(){
                    return "ageCancer";
                },
                filterFunction: function(){
                  //arguments[0]();
                  //console.log(arguments[0].toString());                
                    AppActions.refresh({});
                }
            };
            group = {
                all: function(){
                  //console.log(self.props.currData);
                  //console.log("......grouop...");
                    console.log(self.props.currData["ageCancerGroup"].values);
                    return self.props.currData["ageCancerGroup"].values;
                },
                order: function(){
                    //return groups["ageCancerGroup"];
                },
                top: function(){
                    //console.log(".............");
                    return self.props.currData["ageCancerGroup"].values;
                }
            };
        }

        this.setState({dimension: dim, group: group});


    },
    componentDidMount: function(){

        var self = this;
        var visType = this.props.config.visualization.visType;
        var divId = "#dc-"+this.props.config.attributeName;
        
        var domain = this.props.config.domain || [0,100];
        var height = this.props.config.visualization.height || 190;
        //var domain = [0,100];
        var c = {};
        
        //console.log(this.props.config);

        //Render according to chart-type
        switch(visType){
        case "pieChart":
            c   = dc.pieChart(divId);
            c.width(250)
            .height(190).dimension(self.state.dimension)
            .group(self.state.group)
            .radius(90)
            .renderLabel(true);
            c.filterHandler(function(dimension, filters){
                if(filters)
                    dimension.filter(filters);
                else
                    dimension.filter(null);
                return filters;
            });
            break;
        case "scatterPlot":
            //console.log("scatterPlot");
            //console.log(self.state);
            //console.log(self.state["group"].all());
            //console.log(self.state);
            
            c = dc.scatterPlot(divId);
            c.width(240)
            .height(240)
            .dimension(self.state.dimension)
            .group(self.state.group)
            .x(d3.scale.linear().domain([20,100]))
            .yAxisLabel("cancer status")
            .xAxisLabel("age");
            
            break;
        case "barChart":
            c = dc.barChart(divId);
            c.width(260)
                .height(200).dimension(self.state.dimension)
                .group(self.state.group)
                .x(d3.scale.linear().domain(domain))
          
                //.xUnits(function(){return 10;})
                .elasticY(true)
                .elasticX(true);

                c.select("g.axis.y")
                    .attr("transform", "translate(71, 0)");

                //.renderLabel(true)
                //.margins({left: 35, top: 10, bottom: 20, right: 10});
            c.filterHandler(function(dimension, filter){

                var begin = $("#filterBeg"+dimension.name());
                var end = $("#filterEnd"+dimension.name());
                if(filter.length > 0 && filter.length!=2){
                    filter = filter[0];
                }
                begin.val(filter[0]);
                end.val(filter[1]);
                dimension.filter(filter);
                return filter;
            });
            //Put reset
            //$("#"+(self.prop.config.name)+"-note").html("<button></button>")

            //Put filtering form


            break;
        case "rowChart":
            c = dc.rowChart(divId);
            c.width(250)
            .height(height)
            .dimension(self.state.dimension)
            .group(self.state.group)
            .renderLabel(true)
            .elasticX(true)
            .margins({top: 10, right: 20, bottom: 20, left: 20});
            c.filterHandler(function(dimension, filters){
                console.log(filters);
                var invert = false;
                var invertedFilters = [];
                for(var i in filters){
                    console.log(i);
                    if(filters[i].invert){
                        invert = true;
                        invertedFilters = filters[i].invert;
                        console.log("inverting");
                    }
                }
                if(invert){
                    console.log("here");
                    dimension.filter(invertedFilters);
                    return invertedFilters;
                }
                
                console.log(filters);
                if(typeof filters[0] === "object")
                    filters = filters[0];
                if(filters)
                    dimension.filter(filters);
                else
                    dimension.filter(null);
                return filters;
            });
            c.label(function(d){
                return d.key + " ("+ d.value + ")";
            });
            c.ordering(function(d){return +d.key;});
			/*
			c.renderlet(function(chart){
				var bars = chart.selectAll("rect").each(function(d){barsData.push(d);});
				var gLabels = d3.select(bars).append('g').attr('id', '
				for(var i =bars[0].length -1; i>=0; i==){
						
				}


			});
			*/
        }
        this.setState({chart: c});
    },
    onReset: function(){

        //e.preventDefault();
        var c  = this.state.chart;
        //console.log("Reset");
        c.filterAll();
        //dc.renderAll();
    },
    showChart: function() {
        var self = this;
        console.log("show!");
        var showChart = self.state.showChart;
        this.props.onToggleShow();
        self.setState({showChart: !showChart});
    },
    isFilterActive: function(){
        var dim = this.props.config.attributeName;
        var filters = queryFilter;
        //console.log("Filters");
        for(var i in filters){
            //console.log(i);
            if(dim == i)
                return true;
        }
        return false;
    },
    render: function(){
        var self = this;
        var divId = "dc-"+this.props.config.attributeName;
        var showChart = self.state.showChart ? {display: "block"} : {display: "none"};

        var iconHeight = "20px";
        var iconWidth = "20px";

        var isFilterActive = this.isFilterActive();
        //console.log(isFilterActive);
        var filterFillColor = isFilterActive ? "#fff": "#000";

        //console.log(showChart);
        //console.log(this.props.currData);
        if(this.props.full === true){
            console.log("FULL!");
            return (
                <div className="grid-item" style={{"margin": 10}} key={self.props.config.attributeName}>
               
                    <div className="chart-wrapper">
                        <div className="chart-title">
                            {self.props.config.attributeName}
							<div className="chart-title-icons">
                                { isFilterActive ?
                                <svg style={{width:iconWidth,height:iconHeight }} viewBox="0 0 24 24" onClick={self.onReset}>
                                    <path fill={filterFillColor} d="M14.73,20.83L17.58,18L14.73,15.17L16.15,13.76L19,16.57L21.8,13.76L23.22,15.17L20.41,18L23.22,20.83L21.8,22.24L19,19.4L16.15,22.24L14.73,20.83M2,2H20V2H20V4H19.92L14,9.92V22.91L8,16.91V9.91L2.09,4H2V2M10,16.08L12,18.08V9H12.09L17.09,4H4.92L9.92,9H10V16.08Z">
                                        <title>Remove filter</title>
                                    </path>
                                </svg>
                                :
                                    <div />
                                }


							</div>
                        </div>
                        <div>
                            <div className="chart-stage">
                                <div  id={divId}> </div>
                            </div>
                            <div className="chart-notes" id={self.props.config.attributeName +  "-note"}>

                                <ChartAddons config={this.props.config} data={this.state.currData} chart={this.state.chart} isFilterActive={isFilterActive}/>

                            </div>
                        </div>
                    </div>
              
                </div>
            );
        } else {
            return (
                <div className="grid-item" onClick={this.fullView} key={self.props.config.attributeName}>
                    <div className="chart-wrapper">
                        <div className="chart-title" >
                            {self.props.config.attributeName}
                            <div className="chart-title-icons">
                            { isFilterActive ?

                                <svg style={{width:iconWidth,height:iconHeight }} viewBox="0 0 24 24" onClick={self.onReset}>
                                    <path fill={filterFillColor} d="M14.73,20.83L17.58,18L14.73,15.17L16.15,13.76L19,16.57L21.8,13.76L23.22,15.17L20.41,18L23.22,20.83L21.8,22.24L19,19.4L16.15,22.24L14.73,20.83M2,2H20V2H20V4H19.92L14,9.92V22.91L8,16.91V9.91L2.09,4H2V2M10,16.08L12,18.08V9H12.09L17.09,4H4.92L9.92,9H10V16.08Z">
                                        <title>Remove filter</title>
                                    </path>
                                </svg>
                                :
                                <div />
                            }
								{ self.state.showChart ?
                                <svg  style={{width: iconWidth ,height:iconHeight}} viewBox="0 0 24 24" onClick={self.showChart} >
                                    <path fill="#fff" d="M20,14H4V10H20">
                                        <title>Hide attribute</title>
                                    </path>
                                </svg>
								:
									<svg style={{width: iconWidth, height: iconHeight}} onClick={self.showChart} viewBox="0 0 24 24">
										<path fill="#fff" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z">
											<title> Show attribute</title>
										</path>
											
									</svg>
								}
                            </div>
                        </div>
                       
                        <div style={showChart}>
                            <div className="chart-stage">
                                <div  id={divId}> </div>
                            </div>
                            <div className="chart-notes">
                                <ChartAddons config={this.props.config} data={this.props.currData} chart={this.state.chart} isFilterActive={isFilterActive}/>
                            </div>
                        </div>
 

                    </div>
                </div>
            );
        }

    }
});
module.exports = FilteringAttribute;
