
var filteredData = {};
var queryFilter = {};
var dataTable;
var AppActions = require("./actions/AppActions.jsx");
var AppStore = require("./stores/AppStore.jsx");
var Reflux = require('reflux');
var addons = require("react/addons");
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
                            currData: filteredData
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
        this.setState({currData: filteredData})
      },
      onFilter: function(){



        this.setState({currData: AppStore.getData()});
        dc.renderAll();
        if(dataTable.ajax){  
            dataTable.ajax.reload(); //jquery datatable fix
        }

      },
      render: function(){
        return (
          <div>
            <InteractiveFilters onFilter={this.onFilter} config={this.state.interactiveFilters} currData={this.state.currData}>
            </InteractiveFilters>
            <Visualizations config ={this.state.visualization} onRefresh={this.handleRefresh} currData={this.state.currData}>
            </Visualizations>
          </div>
        );
      }

});


React.render(<Dashboard />, document.getElementById("main"))
