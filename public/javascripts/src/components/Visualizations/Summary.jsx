/* global d3 */
/* global queryFilter */
var React = require("react");

var AppStore = require("../../stores/AppStore.jsx");
var ReactBootStrap = require("react-bootstrap");
var Glyphicon = ReactBootStrap.Glyphicon;

var summaryChart = function(data) {
    //var width = "500px";

    var Current = data.Current;
    var Total = data.Total;
    console.log("Rendering chart");
    
    d3.select(".summaryPopulationBar")
        .remove();
    
    d3.select(".summaryPopulation")
        .append("div")
        .attr("class", "summaryPopulationBar")
        .style("width", function(){
            console.log("..");
            return 500 * (Current/Total) + "px"; 
        })
        /*
        .text(function(){
            //return Current + "/" + Total + " Selected";
        })
        */
        .style("background", function(){
            return "steelblue";
        });
};

var Summary = React.createClass({
    getInitialState: function(){
        return {Current: "", Total: ""};
    },  
    componentDidMount: function(){
        var self=this;    
        self.unsubscribe = AppStore.listen(self.onFilter);


        d3.json("populationInfo/?filter="+JSON.stringify(queryFilter), function(data){
            console.log("Populationdata");
            console.log(data);
            self.setState({Current: data.Current, Total: data.Total});
        });

    },
    onFilter: function(){
        var self = this;
        d3.json("populationInfo/?filter="+JSON.stringify(queryFilter), function(data){
            console.log("Populationdata");
            console.log(data);   
            summaryChart(data);
            self.setState({Current: data.Current, Total: data.Total});
        });
    },
    componentWillReceiveProps: function(){

    },
    render: function(){
        var self = this;
        var filters  = queryFilter;
        console.log(AppStore.getData());    
        console.log(filters);
        var filters_arr = [];
        var i =0;
        for(var f in queryFilter){
            filters_arr[i] = {};
            filters_arr[i].filter = f;
            filters_arr[i].value=  queryFilter[f];
            i++;
        }
        var filterFillColor = "#333";


        var Filters = filters_arr.map(function(f){
            return <div className="filterSummary">
                <div className="filterName">{f.filter}</div>
                <div className="filterValue">{JSON.stringify(f.value)}</div>
                <span className="filterRemove">
                    <Glyphicon glyph="remove" className="filterButton"/>                    

                </span>
                </div>;
        });

        return(
            <div id="summary">

                <span className="summaryPopulation">
                        <span className="summaryPopulationLabel">
                            {self.state.Current}/{self.state.Total} Selected
                        </span>
                </span>
                { filters_arr.length ?

                    <div id="queryString">
                        Filters
                        <div id="queryStringQuery">
                            {Filters}
                        </div>
                    </div>
                :
                    <div />
                }
            </div>
        );
    }
});

module.exports = Summary;
