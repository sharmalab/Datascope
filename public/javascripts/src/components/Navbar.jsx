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
       return {showSharedUrl: false, showDatadict: false};
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
      this.setState({showSharedUrl: false, showDatadict: false});
    },
    handleShare: function(text) {
      console.log(text);
      copy(text);
      console.log("text: "+text);
      console.log("copied!");
      this.setState({showSharedUrl: true});
    },
    handleDict: function(){
      this.setState({showDatadict: true});
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
                      <span className='updatedate'>Last Updated:  January 7, 2019</span>
                      <span className='download dictionary' href={'#'} onClick={() => self.handleDict()} id='dd'><img style={{"height": "24px", "width": "24px"}} title="Dictionary" src='images/Pencil.png' /></span>
                      <span className='download' href={'#'} onClick={() => self.handleShare(shareurl)} id='dl'><img title="Share" src='images/ic_share_black_24dp_1x.png' /></span>
                      <a className='download' href={url} target='_blank' id='dl'><img title="Download cohort" src='images/Download1.png' /></a>
                      <a className='download bulk_downlad' href="mailto:help@cancerimagingarchive.net?subject=Bulk%20Download%20Request" id='bdl'><img title="Request for Bulk Download" src='images/folder.png' /></a>
                      <a className='download help' href="https://docs.google.com/presentation/d/1NuFCBDh9AV3Q8PgUveGXdBbYNVw8Jl5ZJB9h0UVUw6E/edit?usp=sharing" target='_blank' id='hlp'><img title="Help Presentation" src='images/information.png' /></a>
                    </ul>

            </div>
              {self.state.showSharedUrl ?
              <div id="shareurldiv">
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Title>Sharable URL</Modal.Title>
                </Modal.Header>
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
              {self.state.showDatadict ?
              <div id="shareurldiv">
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Title>Dictionary</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <table id="dicttable">
                  <thead><tr><th>Data Dictionary  Headers</th><th>Header Descriptions</th></tr></thead><tbody>
                  <tr><td>Case ID</td><td>Case identifier that is assigned by TSS after completing the "Screening and Eligibility" and "Consent and Enrollment" forms and the candidate meets protocol criteria. This includes cases that have not filled out ANY other forms, so tumor type might not by assigned yet or most any other values in this table.</td></tr>
                  <tr><td>Speciment ID</td><td>Unique identifier for each tumor segement collected at TSS</td></tr>
                  <tr><td>Slide ID</td><td>Unique identifier for the slide created from the tissue</td></tr>
                  <tr><td>Tumor Type</td><td>Acronyms for all 10 CPTAC tumor types</td></tr>
                  <tr><td>Topographic Site</td><td>Primary anatomical site of cancer. This value is assigned in the "Consent and Enrollment" form.</td></tr>
                  <tr><td>Specimen Type</td><td>Identifies the type of specimens including: tumor, normal, bone marrow, and blood</td></tr>
                  <tr><td>Weight</td><td>Weight (in mg) of a normal or tumor tissue.  Value will be N/A if Type is blood or marrow.</td></tr>
                  <tr><td>Tumor Site</td><td>No description provided</td></tr>
                  <tr><td>Percent Tumor Nuclei</td><td>Pathologist's estimation of the percentage of tumor cells present in the tissue sample</td></tr>
                  <tr><td>Percent Total Cellularity</td><td>Pathologist's estimation of the percentage of cells present in the tissue sample</td></tr>
                  <tr><td>Percent Necrosis</td><td>Pathologist's estimation of the percentage of dead cells present in the tissue sample</td></tr>
                  <tr><td>Volume</td><td>Volume in ml of the blood or bone marrow</td></tr>
                  <tr><td>Percent Blast</td><td>Percent of blasts out of all marrow (or blood) cells. Leukemic blasts are immature blood cells that do not grow and age normally; they proliferate wildly and fail to mature. This is often used to determine if a patient has Leukemia.</td></tr>
                  </tbody>
                </table>
                <div><p>**Note that negative values denote missing data for numeric fields.</p></div>
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
