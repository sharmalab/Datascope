//var AppActions = require("../actions/AppActions.jsx");

var React = require("react");
var ReactBootstrap = require("react-bootstrap");
var    Button          = ReactBootstrap.Button;
//Require app components
var FilteringAttribute = require("./FilteringAttribute.jsx");

var Glyphicon = ReactBootstrap.Glyphicon;
var Masonry = require("react-masonry-component");
//var Masonry = React.createFactory(require("react-masonry-component"))(React);
/*
var Masonry = React.createClass({
    render: function() {
        return <div />;
    }
});
*/
var InteractiveFilters = React.createClass({      
    getInitialState: function(){
        //console.log("Rendering interactive filters");
        return {full:false};
    },
    fullView: function(){
        if(this.state.full){
            if(this.state.full === false){
                this.setState({full: true});
            }
            else{
                this.setState({full: false});
            }

        }else{

            this.setState({full:true});   
        }
    },
    toggleShow: function(){
        this.setState({toggle: true});
    },
    render: function(){
        var filteringAttributes;
        //console.log("....");
        //console.log(this.props.config);
        var self = this;
        var key = 0;
        if(this.props.config){
            filteringAttributes = this.props.config.map(function(filteringAttribute){
                key++;
                return (
                    <FilteringAttribute key={key} onToggleShow={self.toggleShow.bind(self)} config={filteringAttribute} currData={self.props.currData} full={self.state.full} />
                );
            });
        }


        if(this.state.full){
            return(
                <div  className="col-sm-12 fixed" id="interactiveFiltersPanel">
                    
                    <Button onClick={this.fullView} id="interactiveFiltersPanelSlider" bsSize="xsmall">
                        <Glyphicon glyph="chevron-left" />
                    </Button>
                    <Masonry className={"filteringFullView"} elementType={"div"} options={{itemSelector: ".grid-item"}} >
                        <div className="filteringAttributesList">{filteringAttributes}</div>                    

                    </Masonry>
                </div>
            );   

        } else {
            return(
                <div  className="col-sm-5 col-md5 col-lg-4 fixed side" id="interactiveFiltersPanel"  >

                     <Button title="Full view" onClick={this.fullView}  id="interactiveFiltersPanelSlider" bsSize="xsmall">
                        <Glyphicon glyph="chevron-right" />
                     </Button>
                    <Masonry className={"filteringFullView"} elementType={"div"} options={{itemSelector: ".grid-item", isFitWidth: true}}>
                        <div className="filteringAttributesList">{filteringAttributes}</div>
                    
                    </Masonry>

                </div>
            );            
        }

    }
});

module.exports = InteractiveFilters;
