/* global d3 */
/* global dc */

var filteredData = {};
var queryFilter = {};
//var dataTable;

var React = require("react");
var ReactDOM = require("react-dom");
var AppActions = require("./actions/AppActions.jsx");
var AppStore = require("./stores/AppStore.jsx");
//var Reflux = require('reflux');
var InteractiveFilters = require("./components/InteractiveFilters.jsx");
var Visualizations = require("./components/Visualizations.jsx");

//var Loader = require('react-loader');

var interactiveFilters = {},
    visualization = {};
var Dashboard = React.createClass({
        //mixins: [Reflux.connect(AppStore,"currData")], // will set up listenTo call and then do this.setState("currData",data)
    componentDidMount: function(){      
        var self=this;    

//        console.log("Waxzaaswoot!"); adsff
        self.unsubscribe = AppStore.listen(self.onFilter);

        d3.json("config/interactiveFilters.json", function(err, data) {

            if(err) {
                console.log(err);
                return;
            }
            interactiveFilters = data;
            d3.json("config/visualization.json", function(err, data) {

                if(err) {
                    console.log(err);
                    return;
                }
                visualization = data;   
                AppActions.refresh(queryFilter); //Initial refresh
                filteredData = AppStore.getData();
                //Do the initial filtering 
                d3.json("/data?filter={}", function(d) {
                    filteredData = d;

                    self.setState({
                        interactiveFilters: interactiveFilters,
                        visualization: visualization,
                        currData: filteredData,
                        loaded: true,
                        debug: 0
                    });
                    
                    dc.renderAll();
                });
                
                
            });

        });
    },
    componentWillMount: function(){

    },
    getInitialState: function(){
        return {interactiveFilters: null, visualization: null, filter: null, loaded: false};
    },
    onFilter: function(){

        var data = AppStore.getData();
        //var debug=this.state.debug+1;
        this.setState({currData: data});
        dc.renderAll();

    },
    render: function(){
        //var currData = this.state.currData;
          //interactiveFiltersData = currData.interactiveFilters,
          //visualizationData = currData.visualization;
        console.log(this.state.loaded);
        return (
          <div>
            <InteractiveFilters onFilter={this.onFilter} config={this.state.interactiveFilters} currData={this.state.currData}>
            </InteractiveFilters>
            <Visualizations config ={this.state.visualization} debug={this.state.debug} currData={this.state.currData}>
            </Visualizations>
          </div>
        );
    }

});


ReactDOM.render(<Dashboard />, document.getElementById("main"));
