/* global queryFilter */
/* global d3 */
/* global Theme */
/* global document */
var React = require("react");
var Modal = require('react-bootstrap').Modal;
var DocumentTitle = React.createFactory(require("react-document-title"));
var FormControl = require('react-bootstrap').FormControl;
var Summary = require("./Visualizations/Summary.jsx");
var Button = require('react-bootstrap').Button;
var copy = require('copy-to-clipboard');


var NavBar = React.createClass({
    getInitialState: function(){
       return {showSharedUrl: false}; 
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
    handleClose: function(){
      this.setState({showSharedUrl: false});
    },
    handleShare: function(text) {
      console.log(text);
      copy(text);
      console.log("text: "+text);
      console.log("copied!");
      this.setState({showSharedUrl: true});
    },
    render: function() {
        

        var self = this;
        var projectTitle = this.state.projectTitle || "DataScope";
        var dashboardConfig = this.state.dashboardConfig;
        
        var primaryColor1 = Theme.primaryColor1;
        var headerColor1 = Theme.headerColor1;
        var theme = {};
        if(dashboardConfig){
            theme = dashboardConfig.theme;    
        }
        var url = "save?filter="+JSON.stringify(queryFilter);
        var shareurl =  window.location.href.split('?')[0] + "?filter="+JSON.stringify(queryFilter);
        //var theme = dashBoardConfig.theme;
        return (
            <div>
            <div className='navbar navbar-inverse navbar-fixed-top' id='header' role='navigation' style={{"background": Theme.headerColor1}} >

             
                <div className='navbar-header'>
                    <div className="navbar-brand" style={{"background": primaryColor1, "width": "340px"}}>{projectTitle}</div>
                        
                </div>
                    <div id="summary">
                    <Summary />
                    </div>                   
                    <ul className="nav navbar-nav navbar-right navbar-options">
                      <span className='download' href={'#'} onClick={() => self.handleShare(shareurl)} id='dl'><img title="Share" src='images/ic_share_black_24dp_1x.png' /></span>                   
                      <a className='download' href={url} target='_blank' id='dl'><img title="Download cohort" src='images/Download1.png' /></a>
                    </ul>

            </div>
              {self.state.showSharedUrl ?
              <div id="shareurldiv">
              <Modal.Dialog>
                <Modal.Body>
                  URL copied to clipboard!
                  <FormControl value={shareurl} type="text" />

                </Modal.Body>
                <Modal.Footer>
                  <Button onClick={self.handleClose}>Close</Button>
                </Modal.Footer>
              </Modal.Dialog>
              </div>
              : 
              <div />

              }
            </div>
        );
    }

});

module.exports = NavBar;
