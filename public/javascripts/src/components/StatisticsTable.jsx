var React = require("react");

var StatisticsTable = React.createClass({

    render: function() {
        var headerComponents = this.generateHeaders(),
            rowComponents = this.generateRows();

        return (
            <table className="statistics">
                <thead><tr>{headerComponents}</tr></thead>
                <tbody>{rowComponents}</tbody>
            </table>
        );
    },

    generateHeaders: function() {
        var cols = this.props.cols;

        // generate our header (th) cell components
        var key = 0;
        return cols.map(function(colData) {
            key++;
            return <th key={key}>{colData}</th>;
        });
    },

    generateRows: function() {
        var cols = this.props.cols,
            data = this.props.data;

        return data.map(function(item) {
            // handle the column data within each row
            var cells = cols.map(function(colData) {
                console.log(item[colData]);
                return <td>{item[colData]}</td>;
            });
            return <tr>{cells}</tr>;
        });
    }
});

module.exports = StatisticsTable;
