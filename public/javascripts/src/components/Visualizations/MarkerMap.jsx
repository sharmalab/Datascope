/* global dc */
var React = require("react");
var AppActions = require("../../actions/AppActions.jsx");

/*
    React component for creating a Marker map visualization.
*/
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
                    queryFilter[attributeName] = {
                        filters: f,
                        type: "marker"
                    };
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
            filterFunction: function (f) {

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

        marker.filterHandler(function (dimension, filters) {
            if(filters)
                dimension.filter(filters);
            else
                dimension.filter(null);
            return filters;
        });

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

        /* leaflet maps works bad with ReactJS. When opening the map, it will look very bad,
            unles I am using the next 2 lines of code :D */
        if (this.state.chart) {
            this.state.chart.map().invalidateSize(false);
        }

        return(
            <div id="holder">
                <div id="demo1">
                    <i>{this.props.config.heading}</i>
                    <div className="map"></div>
                </div>
            </div>
        );
    }
});

module.exports = MarkerMap;
