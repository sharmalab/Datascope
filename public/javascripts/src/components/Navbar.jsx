
var React = require("react");

var NavBar = React.createClass({

    render: function() {
        return(
            <div className='navbar navbar-inverse navbar-fixed-top' id='header' role='navigation'>
                <div className='navbar-header'>
                    <div className="navbar-brand">Data Explorer</div>
                        
                </div>

                    <ul className="nav navbar-nav navbar-right navbar-options">
                        <li><a href="#">Download</a></li>
                    </ul>
            </div>
        );
    }

});

module.exports = NavBar;
