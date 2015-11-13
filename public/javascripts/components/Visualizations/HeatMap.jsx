var React = require("react");
var HeatMap = React.createClass({
    getInitialState: function(){
        return({dimension: null, group: null})
    },
    componentWillMount: function(){



    },

    componentDidMount: function(){
        var self = this;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        refresh();
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];
                        refresh()
                      } else {
                        return;
                      } 
                    }
            },
            filterAll: function() {
                    delete queryFilter[attributeName];
                    refresh();
            },
            name: function(){
                    return attributeName;
            }
        };
        var group = {
            all: function() {

                return self.props.currData["heatMap"].values;
                //return filteredData["heatMap"].values;
            },
            order: function() {
                return groups["heatMap"];
            },
            top: function() {

                return self.props.currData["heatMap"].values;
                //return filteredData["heatMap"].values;
            }
        };

        var config = self.props.config.attributes;
        for (var i=0; i<config.length; i++) {

            attribute = config  [i];
            if(attribute.type == "x"){
                xAttr = attribute.name;
            }
            if(attribute.type == "y"){
                yAttr = attribute.name;
            }    
        }       
        console.log(dim) 

        var heat = dc.heatMap("#heatVis");
        heat.width(45 * 20 + 20)
        .height(45 * 5+260 )
        .dimension(dim)
        .group(group)
        .keyAccessor(function(d) { return +d.key[0]; })
        .valueAccessor(function(d) { return +d.key[1]; })
        .colorAccessor(function(d) { return +d.value; })
        .title(function(d) {
            return "AgeatInitialDiagnosis:   " + d.key[0] + "\n" +
                   "KarnofskyScore:  " + d.key[1] + "\n" +
                   "Total: " + ( + d.value);})
        .colors(["#ffffff","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
        .calculateColorDomain(); 
        //heat.render()  
        console.log(heat)

    },
    render: function(){

        //console.log(this.props.config);
        return(
            
            <div id="heat">
                <h2>{this.props.config.heading}</h2>
                <h4>{this.props.config.subheading}</h4>
                <div id="heatVis"></div>
             </div>
        );
    }
});

module.exports = HeatMap;
