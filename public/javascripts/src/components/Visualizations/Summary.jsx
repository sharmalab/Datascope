/* global d3 */
/* global queryFilter */
/* global globalDataSourceName */
var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");
var AppStore = require("../../stores/AppStore.jsx");
var ReactBootStrap = require("react-bootstrap");
var Glyphicon = ReactBootStrap.Glyphicon;

var summaryChart = function(data) {
    //var width = "500px";

    var Current = data.Current;
    var Total = data.Total;

    d3.select(".summaryPopulationBar")
        .remove();

    d3.select(".summaryPopulation")
        .append("div")
        .attr("class", "summaryPopulationBar")
        .style("width", function(){
            //console.log("..");
            return 400 * (Current/Total) + "px";
        })
        .style("background", function(){

            return "#f47a7e";
        });
};

var Summary = React.createClass({
    getInitialState: function(){
        return {Current: "", Total: "", showSummary: false};
    },
    componentDidMount: function(){
        var self=this;
        self.unsubscribe = AppStore.listen(self.onFilter);


        d3.json("populationInfo/?filter=" + JSON.stringify(queryFilter) + "&dataSourceName=" + globalDataSourceName, function (data) {

            self.setState({Current: data.Current, Total: data.Total});
        });

    },
    onFilter: function(){
        var self = this;
        d3.json("populationInfo/?filter=" + JSON.stringify(queryFilter) + "&dataSourceName=" + globalDataSourceName, function (data) {

            summaryChart(data);
            self.setState({Current: data.Current, Total: data.Total});
        });
    },
    componentWillReceiveProps: function(){

    },
    removeFilter: function(f){
        delete queryFilter[f.filter];
        AppActions.refresh(queryFilter);

u        //console.log(queryFilter);
    },
    hideSummary: function(){
        var show = this.state.showSummary;
        this.setState({showSummary: !show});
    },
    render: function(){
        var self = this;
        //var filters  = queryFilter;
        //console.log(AppStore.getData());
        //console.log(filters);
        var filters_arr = [];
        var i =0;
        for(var f in queryFilter){
            filters_arr[i] = {};
            filters_arr[i].filter = f;
            filters_arr[i].value=  queryFilter[f];
            i++;
        }
        //var filterFillColor = "#333";


        var Filters = filters_arr.map(function(f){
            return <div className="filterSummary">
                <div className="filterName">{f.filter}</div>
                <div className="filterValue">{JSON.stringify(f.value)}</div>
                <span className="filterRemove">
                    <Glyphicon glyph="remove" className="filterButton" onClick={self.removeFilter.bind(self, f)} />

                </span>
                </div>;
        });
        var display = "";
        if(self.state.showSummary){
            display = "block"
        } else{
            display = "none"
        }
        display = "block";
        return(
            <div id="summary">
                <span className="summaryBody">
                    <div>

                        <div style={{"display": display}} id="summaryMain">
                        <span className="summaryPopulation">
                                <span className="summaryPopulationLabel">
                                  Selected: {self.state.Current} slides. Total: {self.state.Total} slides.
                                </span>
                        </span>

                        </div>

                    </div>

                </span>
            </div>
        );
    }
});

module.exports = Summary;
