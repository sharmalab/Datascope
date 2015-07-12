


var BubbleChart = React.createClass({
    componentWillMount: function(){
     //Initialize crossfilter dimensions and groups before rendering

        var attributeName = this.props.config.name;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        refresh()
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
                    return filteredData[attributeName].values;
                },
                order: function() {
                    return groups[attributeName];
                },
                top: function() {
                    return filteredData[attributeName].values;
                }
 
        };

        this.setState({dimension: dim, group: group});
    },
    componentDidMount: function(){
        var config = this.props.config;

        var visualAttributes = this.props.config.attributes;
        var xAttr;
        var yAttr;
        var rAttr;
        var colorAttr;
        for (var i=0; i<visualAttributes.length; i++) {
            attribute = visualAttributes[i];

            if(attribute.type == "x"){
                xAttr = attribute.name;
            }
            if(attribute.type == "y"){
                yAttr = attribute.name;
            }
            if(attribute.type == "r"){
                rAttr = attribute.name;
            }
            if(attribute.type == "color"){
                colorAttr = attribute.name;
            }    
        }
        visBubbleChart = dc.bubbleChart("#vis");

        visBubbleChart.width(900)
            .height(400)
            .dimension(dimensions["visualization"])
            .group(groups["visualization"])
            .maxBubbleRelativeSize(0.4)       
            .margins({top: 50, right: 50, bottom: 30, left: 40})
            .colors(colorbrewer.RdYlGn[9]) // (optional) define color function or array for bubbles
            .colorAccessor(function(d){
                return d.value[colorAttr];
            })
            .radiusValueAccessor(function(d){
                return d.value[rAttr]/100000;
            })
            .keyAccessor(function(d){
                return d.value[xAttr];
            })
            .valueAccessor(function(d){
                return d.value[yAttr];
            })
            .x(d3.scale.linear().domain([0, 100]))
            .y(d3.scale.linear().domain([0, 10]))
            .r(d3.scale.linear().domain([0, 10]))
            .elasticY(true)
            .elasticX(true)
            .yAxisPadding(100)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
            .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false


        },
    render: function(){
        return(
            <div id="vis">

            </div>
        )
    }

});

module.exports = BubbleChart;
