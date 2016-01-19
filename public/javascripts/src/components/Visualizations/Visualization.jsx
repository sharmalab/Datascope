var React =require("react");
var DataTable = require("./DataTable.jsx"),
    HeatMap = require("./HeatMap.jsx"),
    ImageGrid = require("./ImageGrid.jsx"),
    Splom = require("./Splom.jsx");

var Visualization = React.createClass({
    render: function(){
        var visType = this.props.config.visualizationType;
        //var self = this;
        //console.log("Visualization");
        //console.log(visType);
        
        switch(visType) {
        
        case "dataTable": 
            return(
                <DataTable config={this.props.config} currData = {this.props.currData} />
            );
            //break;
        case "bubbleChart":
            return(
                <div></div>
            );
            //break;
        case "heatMap":
            return(
                <HeatMap config={this.props.config} currData = {this.props.currData} />
            );
            //break;
        case "imageGrid":
            return(
                <ImageGrid config={this.props.config} debug={this.props.debug} currData = {this.props.currData} />
            );
            //break;
        case "SPLOM": 
            return(
                <Splom config={this.props.config} currData={this.props.currData}/>
            );
        default:
            return(
                <div></div>
            );
        }         
          
    }

});

module.exports=  Visualization;
