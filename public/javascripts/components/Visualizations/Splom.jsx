/* global dc */
/* global d3 */

var React = require("react");

var SplomGrid = React.createClass({
    componentDidMount: function(){
        var self = this;
        var attributes = this.props.config.attributes;       
        console.log(self.props.currData);
    
        var rows = attributes.map(function(attribute_row) {
            var row = attributes.map(function(attribute_col) {
                if(attribute_row.attributeName != attribute_col.attributeName){            
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
                    chart.width(200)
                        .height(190)
                        .dimension(dim)
                        .group(group)
                        .x(d3.scale.linear().domain([0,100]));
                    return chart;
                }
            });
        });
    },

    render: function(){
        var attributes = this.props.config.attributes;
        
        var rows = attributes.map(function(attribute){

            var row = attributes.map(function(attribute_col){
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
        console.log(self.props.currData);
        return(
            <div className="splom display" id="">
                <h4>SPLOM</h4>
                <GenericSplom config={self.props.config} currData={self.props.currData} />

            </div>
        );
    }
});

module.exports = Splom;
