/* global dc */
var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");

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
            order: function () {

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
                    .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
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

        return(
            <div id="geo">
                <h2>{this.props.config.heading}</h2>
                <h4>{this.props.config.subheading}</h4>
                <div id="geoVis">
                    { isFilterActive ?
                        <div>
                            <button className="link" onClick={self.onReset}>Reset</button>
                            <p>Current filter: {attributeName} = {queryString}</p>
                        </div>
                        :
                        <div/>
                    }
                </div>
             </div>
        );
    }
});

module.exports = GeoChoroplethMap;
