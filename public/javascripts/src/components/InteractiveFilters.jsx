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
        return {full:false, initialFilters: {}};
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
    getUrlParam: function (name){
         if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
                 return decodeURIComponent(name[1]);
    },   
    componentDidMount: function(){
        var self = this;
        var filter = self.getUrlParam("filter") || "{}";
        console.log("filter: ");
        console.log(JSON.parse(filter));
        
        self.setState({initialFilters : JSON.parse(filter)});
    },
    render: function(){
        var filteringAttributes;


        var self = this;
        var key = 0;

        var theme = {};

        if(this.props.dashboardConfig){
            theme = this.props.dashboardConfig.theme;

        }


        if(this.props.config){
            filteringAttributes = this.props.config.map(function(filteringAttribute){

                var filteringAttributeName = filteringAttribute.attributeName;

                var initialFilter = {};
                if(self.state.initialFilters[filteringAttributeName]){

                  initialFilter = self.state.initialFilters[filteringAttributeName];
                }
                key++;

                return (
                    <FilteringAttribute key={key} onToggleShow={self.toggleShow} config={filteringAttribute} currData={self.props.currData} full={self.state.full} initialFilters={initialFilter}/>
                );
            });
        }
        //console.log(filteringAttributes[0].getDcChart());


        if(this.state.full){
            return(
                <div  className="col-sm-12 fixed" id="interactiveFiltersPanelFull">

                    <Button onClick={this.fullView} id="interactiveFiltersPanelSlider" title="Minimize Filters" bsSize="large">
                        <Glyphicon glyph="chevron-left" />
                    </Button>
                    <Masonry className={"filteringFullView"} elementType={"div"} options={{itemSelector: ".grid-item"}} >
                        <div className="filteringAttributesList">{filteringAttributes}</div>

                    </Masonry>
                </div>
            );

        } else {
            return(
                <div  className="" id="interactiveFiltersPanel"  >

                     <Button title="Full view" onClick={this.fullView}  id="interactiveFiltersPanelSlider" bsSize="large">
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
