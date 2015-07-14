
var filteredData = {};
var queryFilter = {};
var dataTable;
var AppActions = require("./actions/AppActions.jsx");
var AppStore = require("./stores/AppStore.jsx");
var Reflux = require('reflux');
var InteractiveFilters = require("./components/InteractiveFilters.jsx");
var Visualizations = require("./components/Visualizations.jsx");


var Dashboard = React.createClass({
        mixins: [Reflux.connect(AppStore,"currData")], // will set up listenTo call and then do this.setState("messages",data)
        //mixins: [Reflux.connect(A,"messages")], // will set up listenTo call and then do this.setState("messages",data)
        componentDidMount: function(){      
            var self=this;    

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

                    
                    d3.json("/data?filter={}", function(d) {
                        filteredData = d;
                    
                        //console.log(filteredData);

                        self.setState({
                            interactiveFilters: interactiveFilters,
                            visualization: visualization,
                            currData: filteredData,
                            debug: 0
                        });
                        self.listenTo(AppStore, self.onFilter);
                        dc.renderAll();
                    }.bind(self));
                    

                });

            });
        },
      componentWillMount: function(){
        //console.log(this.unsubscribe)
        if(this.unsubscribe)
            this.unsubscribe();
      },
      getInitialState: function(){
        return {interactiveFilters: null, visualization: null, filter: null};
      },
      handleRefresh: function(filteredData){

        this.setState({currData: filteredData});
      },
      onFilter: function(){

        var data = AppStore.getData();
        var debug=this.state.debug+1;
        this.setState({currData: data, debug:debug});
        console.log("state is set")
        dc.renderAll();
        console.log(DataTable);


      },
      render: function(){
        return (
          <div>
            <InteractiveFilters onFilter={this.onFilter} config={this.state.interactiveFilters} currData={this.state.currData}>
            </InteractiveFilters>
            <Visualizations config ={this.state.visualization} onRefresh={this.handleRefresh} debug={this.state.debug} currData={this.state.currData}>
            </Visualizations>
          </div>
        );
      }

});


React.render(<Dashboard />, document.getElementById("main"))
