var AppActions = require("../actions/AppActions.jsx");

var    Button          = ReactBootstrap.Button;
//Require app components
var FilteringAttribute = require("./FilteringAttribute.jsx");
var InteractiveFilters = React.createClass({      
    getInitialState: function(){

        return {full:false};
    },
    fullView: function(){
        if(this.state.full){
            if(this.state.full == false)
                this.setState({full: true});
            else
                this.setState({full: false});

        }else{

            this.setState({full:true});   
        }
    },
    render: function(){
        var filteringAttributes;

        var self = this;
        if(this.props.config){
            filteringAttributes = this.props.config.map(function(filteringAttribute){
                return (
                    <FilteringAttribute config={filteringAttribute} currData={self.props.currData} full={self.state.full}/>
                );
            })    
        } else {
            filteringAttribute = <div></div>
        }
        if(this.state.full){
            return(
                <div  className="col-sm-12 fixed" id="interactiveFiltersPanel">
                    <h4> Filtering Attributes</h4>
                     <Button onClick={this.fullView} id="interactiveFiltersPanelSlider" bsSize="xsmall"> &laquo; </Button>

                    <div>{filteringAttributes}</div>
                </div>
            );   

        } else {
            return(
                <div  className="col-sm-3 fixed" id="interactiveFiltersPanel" >
                    <h4> Filtering Attributes</h4>
                     <Button onClick={this.fullView}  id="interactiveFiltersPanelSlider" bsSize="xsmall"> &raquo; </Button>

                    <div>{filteringAttributes}</div>
                </div>
            );            
        }

    }
});

module.exports = InteractiveFilters;