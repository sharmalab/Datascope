/* global queryFilter */
var React = require("react");

var NavBar = React.createClass({

    render: function() {
        
        var self = this;
        var filter = queryFilter;
        console.log("queryFilter");
        console.log(filter);
        return(
            <div className='navbar navbar-inverse navbar-fixed-top' id='header' role='navigation'>
                <div className='navbar-header'>
                    <div className="navbar-brand">Data Explorer</div>
                        
                </div>

                    <ul className="nav navbar-nav navbar-right navbar-options">
                        <li><a href={"/save?filter="+JSON.stringify(queryFilter)} target="_blank">Download</a></li>
                    </ul>
            </div>
        );
    }

});

module.exports = NavBar;
