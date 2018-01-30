/* global dc */
var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");


var geoColors = ["#FCDADB","#F7A2A5", "#F47A7E",  "#9C4E51"]
/*
    React component for creating a Cloropleth Map visualization based on a geo json file.
*/

var GeoLegend = React.createClass({
  render: function(){

    var colors = geoColors.map(function(d){
      return <div className='geoLegendRect' style={{"background": d}} />
    });
    return <div className="geoLegend">{colors}</div>;
  }
});
  
var GeoChoroplethMap = React.createClass({
    getInitialState: function () {
        return({dimension: null, group: null, isFilterActive: false});
    },
    componentWillMount: function () {
    },
    componentDidMount: function () {
        var self = this;
        var attributeName = this.props.config.attribute.name;
        var attributeType = this.props.config.attribute.type;

        var dim = {
            filter: function (f) {
                self.changeFilterState(f && f.length != 0 ? true : false);
                if (f) {
                    queryFilter[attributeName] = f;
                    AppActions.refresh(queryFilter);
                } else {
                    if(queryFilter[attributeName]) {
                        delete queryFilter[attributeName];
                        AppActions.refresh(queryFilter);
                    } else {
                        return {};
                    }
                }
            },
            filterAll: function () {
                self.changeFilterState(false);
                delete queryFilter[attributeName];
                AppActions.refresh(queryFilter);
            },
            name: function () {
                return attributeName;
            }
        };
        var group = {
            all: function () {
                return self.props.currData[attributeName].values;
            },
            top: function () {
                return self.props.currData[attributeName].values;
            }
        };

        var geo;
        
        var geoJsonPath = this.props.config.geoJson.path;
        d3.json(geoJsonPath, function (err, geoJson) {
            if (err) {
                console.log(err);
                return;
            }

            geo = dc.geoChoroplethChart("#geoVis")
                    .width(990)
                    .height(500)
                    .dimension(dim)
                    .group(group)
                    .colors(d3.scale.quantize().range(geoColors))
                    .colorDomain(
                        [
                            d3.min(group.all(), function (d) {
                                return d.value;
                            }),
                            d3.max(group.all(), function (d) {
                                return d.value;
                            })
                        ]
                    )
                    .colorCalculator(function (d) { return d ? geo.colors()(d) : '#ccc'; })
                    .overlayGeoJson(geoJson.features, attributeName, function (d) {
                        return d.properties[attributeType];
                    })
                    .title(function (d) {
                        return attributeName + ": " + d.key + "\nNo: " + (d.value ? d.value : 0);
                    });
            geo.filterHandler(function(dimension, filters){
                if(filters)
                    dimension.filter(filters);
                else
                    dimension.filter(null);
                return filters;
            });
            /*
            var filter = JSON.parse(self.getUrlParam("filter"));
            console.log(filter);
            console.log("geo");
            console.log(filter["Origin_State"]);
            if(filter["Origin_State"]){
              console.log("geo filter");
              geo.filter(filter);             
            }
            */


            dc.renderAll();
            self.setState({chart: geo, dimension: dim, group: group});
        });
    },
    changeFilterState: function (isFilterActive) {
        this.setState({isFilterActive: isFilterActive});
    },
    onReset: function () {
        this.state.chart.filterAll();
        this.changeFilterState(false);
    },
    getUrlParam: function (name){
      if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)){
        return decodeURIComponent(name[1]);
      }
    },   
    render: function () {
        /* the color domain needs to be assigned with every render in case the data changed */
        if (this.state.group) {
            this.state.chart.colorDomain(
                [
                    d3.min(this.state.group.all(), function (d) {
                        return d.value;
                    }),
                    d3.max(this.state.group.all(), function (d) {
                        return d.value;
                    })
                ]
            )
        }

        var self = this;
        var attributeName = this.props.config.attribute.name;
        var isFilterActive = this.state.isFilterActive;

        var queryString;
        if (queryFilter[attributeName]) {
            queryString = queryFilter[attributeName].toString();
        }
        console.log(queryString);

        return(
            <div id="geo">

                <h4 style={{"display": "inline"}}>{this.props.config.subheading}</h4>
                <GeoLegend />
                <div id="geoVis">

                </div>
             </div>
        );
    }
});

module.exports = GeoChoroplethMap;
