var DataTable = require("./DataTable.jsx"),
    HeatMap = require("./HeatMap.jsx"),
    ImageGrid = require("./ImageGrid.jsx");


var Visualization = React.createClass({
    render: function(){
        var visType = this.props.config.type;
        var self = this;

        switch(visType) {
            case "dataTable":
                return(
                    <DataTable config={this.props.config} currData = {this.props.currData} />
                );
                break;
            case "bubbleChart":
                return(
                    <div></div>
                );
                break;
            case "heatMap":
                return(
                    <HeatMap config={this.props.config} currData = {this.props.currData} />
                );
            case "imageGrid":
                return(
                    <ImageGrid config={this.props.config} currData = {this.props.currData} />
                );
            default:
                return(
                    <div></div>
                );
        }         
          
    }

});

module.exports=  Visualization;