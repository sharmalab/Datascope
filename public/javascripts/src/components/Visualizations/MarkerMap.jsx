/* global dc */
var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");

var MarkerMap = React.createClass({
    getInitialState: function () {
        return({dimension: null, group: null, isFilterActive: false});
    },
    componentWillMount: function () {
    },
    componentDidMount: function () {
        var self = this;
        var attributeName = this.props.config.attributeName;

        var dim = {
            filter: function (f) {
                self.changeFilterState();
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
                self.changeFilterState();
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
            filterFunction: function (f) {
                console.log("marker map - filter function")
                // TOBE implemented
            },
            filterAll: function () {
                self.changeFilterState();
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

        var marker = dc_leaflet.markerChart("#demo1 .map")
                        .width(700)
                        .height(450)
                        .dimension(dim)
                        .group(group)
                        .fitOnRender(true)
                        .cluster(true)
                        .filterByArea(true);

        dc.renderAll();
        this.setState({chart: marker});
    },
    changeFilterState: function () {
        var isFilterActive = !this.state.isFilterActive;
        this.setState({isFilterActive: isFilterActive});
    },
    onReset: function () {
        this.state.chart.filterAll();
        this.changeFilterState();
    },
    render: function () {
        var self = this;
        var attributeName = this.props.config.attributeName;
        var isFilterActive = this.state.isFilterActive;

        return(
            <div id="holder">
                <div id="demo1">
                    <h2>{this.props.config.heading}</h2>
                    <i>{this.props.config.subheading}</i>
                    <div className="map"></div>
                </div>
            </div>
        );
    }
});

module.exports = MarkerMap;
