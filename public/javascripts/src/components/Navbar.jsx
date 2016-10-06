/* global queryFilter */
/* global d3 */
var React = require("react");
var DocumentTitle = React.createFactory(require("react-document-title"));

var NavBar = React.createClass({
    getInitialState: function(){
       return {}; 
    },  
    componentDidMount: function() {
        var self = this;
        d3.json("config/dashboard", function(config){
            var dashBoardConfig =  config || {};
            console.log(dashBoardConfig.projectTitle);
            var title = dashBoardConfig.projectTitle || "DataScope";
            self.setState({projectTitle: title});

        });

    },
    render: function() {
        


        var projectTitle = this.state.projectTitle || "DataScope";
        return(
            <div className='navbar navbar-inverse navbar-fixed-top' id='header' role='navigation'>
             
                <div className='navbar-header'>
                    <div className="navbar-brand">{projectTitle}</div>
                        
                </div>

                    <ul className="nav navbar-nav navbar-right navbar-options">
                        <li><a href={"/save?filter="+JSON.stringify(queryFilter)} target="_blank">Download</a></li>
                    </ul>
            </div>
        );
    }

});

module.exports = NavBar;
