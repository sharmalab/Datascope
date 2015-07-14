var Visualization = require("./Visualizations/Visualization.jsx")
var TabbedArea      = ReactBootstrap.TabbedArea,
    TabPane         = ReactBootstrap.TabPane;

var Visualizations = React.createClass({
    render: function(){
        var self  = this;

        if(this.props.config){

            var count=0;
            var visualizations = this.props.config.map(function(visualization){

                count++;   
                return(
                    <TabPane tab={visualization.type} eventKey={count}>
                        <Visualization config ={visualization} debug={self.props.debug} currData={self.props.currData}  />
                    </TabPane>
                );            
            });

            return(
                <div id="visualization" className="col-sm-9">
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