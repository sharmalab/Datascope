var React = require("react");

var StatisticsTable = require("../StatisticsTable.jsx");

/*
    React component for creating a two dimensional statistic visualization.
*/
var TwoDimStat = React.createClass({
    getInitialState: function () {
        return {cols: [], data: []};
    },
    componentDidMount: function () {
        var self = this;
        var attr1 = this.props.config.attributes.attr1;
        var attr2 = this.props.config.attributes.attr2;

        var url = "/statistics?attr1=" + attr1 + "&attr2=" + attr2
            + "&dataSourceName=" + globalDataSourceName;
        d3.json(url, function(d) {
            var cols = ["Statistic", "Value"], data = [];
            var attrStatistics = d;
            for (var key in attrStatistics) {
                attrStatistics[key] = Math.round(attrStatistics[key]*100)/100;
                data.push({"Statistic": key, "Value": attrStatistics[key]});
            }
            self.setState({cols: cols, data: data});
        });
    },
    render: function() {
        return (
            <div>
                <h3>{this.props.config.heading}</h3>
                <div>
                    <StatisticsTable cols={this.state.cols} data={this.state.data}/>
                </div>
            </div>
        );
    }
});

module.exports = TwoDimStat;