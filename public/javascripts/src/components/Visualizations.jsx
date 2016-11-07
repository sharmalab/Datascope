
var Visualization = require("./Visualizations/Visualization.jsx");
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

var Summary = require("./Visualizations/Summary.jsx");

var Tabs      = ReactBootstrap.Tabs,
    Tab         = ReactBootstrap.Tab,
    Modal = ReactBootstrap.Modal,
    Button          = ReactBootstrap.Button;



    

var OptionsBar = React.createClass({
    getInitialState: function(){

        //console.log("woot");
        return { showModal: false };
    },

    close: function(){
        this.setState({ showModal: false });
    },

    open: function(){
        this.setState({ showModal: true });
    },
    render: function(){

        //var self = this;
        //console.log(self.state.showModal);
        //console.log(this.props.currData);
        var attributes = [];

        for(var i in this.props.currData){
            attributes.push(i);
        }

        var url = "/save?attributes={list:"+(attributes)+"}";

        var Attributes = attributes.map(function(d){
            return(
                <input type="checkbox" value="{d}">{d}</input>
            );
        });
        return(
            <div>
            <div id="OptionsBar" className="modal-container">
                <Button bsStyle="success" title="Download data" onClick={this.open}> Download</Button>
            </div>
            {

                this.state.showModal ?
                    <Modal show={false} onHide={this.close}>
                            <h1>Download data</h1>
                            
                            {Attributes}
                            
                            <br />
                            <a href={url}><Button>Download</Button></a>
                            <Button onClick={this.close}>Close</Button>

                    </Modal>
                :
                    <div />
            }

            </div>
        );
    }
});

var Visualizations = React.createClass({
    render: function(){
        //console.log("Visualizaitons");
        var self  = this;

        if(this.props.config){
        
            var count=0;
            var visualizations = this.props.config.map(function(visualization){
                //console.log(visualization);
                //console.log(TabPane);
                count++;   

                console.log(visualization.tabTitle);
                if(!visualization.tabTitle)
                    visualization.tabTitle = visualization.visualizationType;
                return(
                    <Tab title={visualization.tabTitle} eventKey={count}>
                        <div className="visualizationArea">
                        <Visualization config ={visualization} debug={self.props.debug} currData={self.props.currData}  />
                        </div>
                    </Tab>
                );            
            });


            /*
             *                    <!--
                    <div id="summary">
                    <Summary />
                    </div>
                    -->
            
            */        
            return(
                <div id="visualization_wrapper">

                    <div id="visualization" className="">
                       
                        <Tabs defaultActiveKey={1}>
                            {visualizations}
                        </Tabs>
                    </div>
                </div>
            );

        }
        return (
            <div></div>
        );
    }
});

module.exports = Visualizations;
