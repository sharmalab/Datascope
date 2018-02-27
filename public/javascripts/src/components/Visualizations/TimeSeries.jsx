/*global dc*/

var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");

var TimeSeries = React.createClass({
    getInitialState: function(){
        return({dimension: null, group: null, timeseriesdata: null, visId: Math.floor(Math.random()*10)});
    },
    componentWillMount: function(){



    },
    componentDidUpdate: function(){
	//console.log("update");
	dc.renderAll();
    },
    componentDidMount: function(){

        var self = this;
        console.log(self.props.config);
        //var queryFilter = {};
        var dim = {
            filter: function() {
            },
            filterAll: function() {
            },
            name: function(){
            }
        };
        var group = {
            all: function() {
                console.log(self.props.config.attribute); 
		return self.props.currData[self.props.config.attribute];
                //return filteredData["heatMap"].values;
            },
            order: function() {
                //return groups["heatMap"];
            },
            top: function() {

                return self.props.currData["timeSeries"];
                //return filteredData["heatMap"].values;
            }
        };

        var config = self.props.config.attributes;      
        var xAttr, yAttr;
        console.log(config);
        for (var i=0; i<config.length; i++) {
            console.log("..........");
            var attribute = config  [i];
            if(attribute.type == "x"){
                xAttr = attribute.attributeName;
            }
            if(attribute.type == "y"){
                yAttr = attribute.attributeName;
            }    
        }       
        console.log(group.values);
        //console.log(dim) 
        var minDate = new Date("2018-01-01T06:59:00.000Z");
        var maxDate = new Date("2018-01-02T00:00:00.000Z");
        
        setTimeout(function(){
          var name = "#"+"timeVis"+self.props.config.attribute;
          console.log(name);
	  var time = dc.seriesChart(name)
	    .width(1000)
	    .height(480)
	    .chart(function(c) { return dc.lineChart(c).interpolate('monotone'); })
	    .x(d3.time.scale().domain([minDate, maxDate]))
	    .brushOn(true)
	    .yAxisLabel(yAttr)
	    .xAxisLabel("Time")
	    .clipPadding(10)
	    //.elasticY(true)
	    .dimension(dim)
	    .group(group)
	    //.mouseZoomable(true) 
	     .seriesAccessor(function(d) { return "Patient: " + d.patientId;})
	    .keyAccessor(function(d) { var x = d.time; 
//              console.log(x);
              x = x.substr(11,2); return new Date(d.time);})//return (+x)-6;})
	    .valueAccessor(function(d) {return +d.HR;})
//            .colors(['#ccc'])
//	    .legend(dc.legend().x(650).y(250).itemHeight(13).gap(5).horizontal(1).legendWidth(200).itemWidth(70));
	  //chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
	  time.margins().left += 20;
          time.filterHandler(function(f,d){
            if(time.ranged2DFilter){
              //queryFilter["time"] = [time.ranged2DFilter[0][1], time.ranged2DFilter[1][1]];
              console.log(time.ranged2DFilter);
              queryFilter["HR"] = [time.ranged2DFilter[0][1], time.ranged2DFilter[1][1]];
              queryFilter["time"] = [time.ranged2DFilter[0][0], time.ranged2DFilter[1][0]];
              console.log(time.ranged2DFilter[0][0]);
              console.log(time.ranged2DFilter[1][0]);
              AppActions.refresh(queryFilter);

              console.log("filtering handler");
            }
          });
	        dc.renderAll();
        }, 300);
        //heat.render()  i
        //cnsole.log(heat)

    },
    render: function(){
        var self = this;
        //console.log(this.props.config);
        return(
            
            <div id="timeseries">
                <h2>{this.props.config.heading}</h2>
                <h4>{this.props.config.subheading}</h4>
                <div id={"timeVis"+self.props.config.attribute}></div>
             </div>
        );
    }
});

module.exports = TimeSeries;
