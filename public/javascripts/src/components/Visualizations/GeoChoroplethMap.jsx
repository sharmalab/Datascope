/* global dc */
var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");

var GeoChoroplethMap = React.createClass({
    getInitialState: function () {
        return({dimension: null, group: null});
    },
    componentWillMount: function () {
    },

    componentDidMount: function () {
        var self = this;
        var attributeName = this.props.config.attributeName;

        var dim = {
            filter: function (f) {
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
            filterExact: function (f) {
                if (f) {
                    queryFilter[attributeName] = f;
                    AppActions.refresh(queryFilter);
                } else {
                    if (queryFilter[attributeName]) {
                        delete queryFilter[attributeName];
                        AppActions.refresh(queryFilter);
                    } else {
                        return {};
                    }
                }
            },
            filterAll: function () {
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
            order: function () {

            },
            top: function () {
                return self.props.currData[attributeName].values;
            }
        };

        var geo = dc.geoChoroplethChart("#geoVis");
        
        var geoJsonPath = this.props.config.geoJson.path;
        d3.json(geoJsonPath, function (err, geoJson) {
            if (err) {
                console.log(err);
                return;
            }

            geo.width(990)
                .height(500)
                .dimension(dim)
                .group(group)
                .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
                .colorDomain([0, 16])
                .colorCalculator(function (d) { return d ? geo.colors()(d) : '#ccc'; })
                .overlayGeoJson(geoJson.features, attributeName, function (d) {
                    return d.properties.NAME;
                })
                .title(function (d) {
                    return attributeName + ": " + d.key + "\nNo: " + (d.value ? d.value : 0);
                });

            dc.renderAll();
        });

    },
    render: function () {
        return(
            <div id="geo">
                <h2>{this.props.config.heading}</h2>
                <h4>{this.props.config.subheading}</h4>
                <div id="geoVis"/>
             </div>
        );
    }
});

module.exports = GeoChoroplethMap;
