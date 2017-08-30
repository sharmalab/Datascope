/* global queryFilter */
/* global d3 */
/* global Theme */
/* global document */
var React = require("react");
var DocumentTitle = React.createFactory(require("react-document-title"));
var Summary = require("./Visualizations/Summary.jsx");



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

            //set HTML document title
            document.title = "Datascope :: "+title;

            self.setState({projectTitle: title, dashBoardConfig: config});

        });

    },
    render: function() {
        


        var projectTitle = this.state.projectTitle || "DataScope";
        var dashboardConfig = this.state.dashboardConfig;
        
        var primaryColor1 = Theme.primaryColor1;
        var headerColor1 = Theme.headerColor1;
        var theme = {};
        if(dashboardConfig){
            theme = dashboardConfig.theme;    


        }
        var url = "save?filter="+JSON.stringify(queryFilter); 
        //var theme = dashBoardConfig.theme;
        return (
            <div className='navbar navbar-inverse navbar-fixed-top' id='header' role='navigation' style={{"background": Theme.headerColor1}} >

             
                <div className='navbar-header'>
                    <div className="navbar-brand" style={{"background": primaryColor1, "width": "340px"}}>{projectTitle}</div>
                        
                </div>
                     <div id="summary">
                    <Summary />
                    </div>                   
                    <ul className="nav navbar-nav navbar-right navbar-options">
                      <a className='download' href={url} target='_blank' id='dl'><img src='images/download.png' />Cohort</a>
                    </ul>
            </div>
        );
    }

});

module.exports = NavBar;
