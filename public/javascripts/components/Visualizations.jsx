var Visualization = require("./Visualizations/Visualization.jsx")
var TabbedArea      = ReactBootstrap.TabbedArea,
    TabPane         = ReactBootstrap.TabPane,
    Glyphicon       = ReactBootstrap.Glyphicon,
    Modal = ReactBootstrap.Modal,
    Input           = ReactBootstrap.Input,
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
        console.log(self.state.showModal);
        console.log(this.props.currData);
        var attributes = [];

        for(var i in this.props.currData){
            attributes.push(i)
        }

        var url = "/save?attributes={list:"+(attributes)+"}"

        var Attributes = attributes.map(function(d){
            return(
                <input type="checkbox" value="{d}">{d}</input>
            )
        })
        return(
            <div>
            <div id="OptionsBar" className='modal-container'>
                <Button bsStyle='success' title="Download data" onClick={this.open}> Download</Button>
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
                    <OptionsBar currData={self.props.currData} />
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