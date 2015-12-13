var React = require("react");

var SplomGrid = React.createClass({
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
        var attributes = this.props.config.attributes;
        //attributes;
        //
        for(var i in attributes){
            var attribute = attributes[i];
            console.log(attribute);
        }
        return(

            <div> 
                <SplomGrid config = {self.props.config} />
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
        return(
            <div class="splom display" id="">
                <h4>SPLOM</h4>
                <GenericSplom config={self.props.config} />

            </div>
        );
    }
});

module.exports = Splom;
