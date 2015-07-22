var Visualization = require("./Visualizations/Visualization.jsx")
var TabbedArea      = ReactBootstrap.TabbedArea,
    TabPane         = ReactBootstrap.TabPane,
    Glyphicon       = ReactBootstrap.Glyphicon,
    Modal = require('react-modal'),

    Button          = ReactBootstrap.Button;



    

var OptionsBar = React.createClass({
  getInitialState(){


    return { showModal: false };
  },

  close(){
    this.setState({ showModal: false });
  },

  open(){
    this.setState({ showModal: true });
  },
    render: function(){

        var self = this;
        return(
            <div id="OptionsBar" lassName='modal-container'>
                    <Button bsStyle='success' title="Download data" onClick={this.open}> Download</Button>

            </div>
        );
    }
})

var Visualizations = React.createClass({
    render: function(){
        var self  = this;

        if(this.props.config){

            var count=0;
            var visualizations = this.props.config.map(function(visualization){

                count++;   
                return(
                    <TabPane tab={visualization.visualizationType} eventKey={count}>
                        <Visualization config ={visualization} debug={self.props.debug} currData={self.props.currData}  />
                    </TabPane>
                );            
            });

            return(
                <div id="visualization" className="col-sm-9">
                    <OptionsBar />
                    <TabbedArea defaultActiveKey={1}>
                        {visualizations}
                    </TabbedArea>
                </div>
            );

        }
        return (
            <div></div>
        );
    }
});

module.exports = Visualizations;