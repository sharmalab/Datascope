var TabbedArea      = ReactBootstrap.TabbedArea,
    TabPane         = ReactBootstrap.TabPane;

var filteredData = {};
var queryFilter = {};
var dataTable;

function refresh() {
    if(JSON.stringify(queryFilter)) {
        for (qf in queryFilter) {
            if(queryFilter[qf].length === 0) {
                delete queryFilter[qf];
            }
        }
        d3.json("/data?filter="+JSON.stringify(queryFilter), function (d) {
            filteredData = d;

            console.log(dataTable);
            if(dataTable.ajax){  
                dataTable.ajax.reload();
            }
            dc.renderAll();
        });
        } else {
            
        }
}



var FilteringAttribute = React.createClass({
    componentWillMount: function(){
        //Initialize crossfilter dimensions and groups before rendering

        var attributeName = this.props.config.name;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        refresh()
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];
                        refresh()
                      } else {
                        return;
                      } 
                    }
                },
            filterAll: function() {
                    delete queryFilter[attributeName];
                    refresh();
                },
            name: function(){
                    return attributeName;
                }
       
        };
        var group = {
                all: function() {
                    return filteredData[attributeName].values;
                },
                order: function() {
                    return groups[attributeName];
                },
                top: function() {
                    return filteredData[attributeName].values;
                }
 
        };

        this.setState({dimension: dim, group: group});

    
    },
    componentDidMount: function(){

        var self = this;
        var visType = this.props.config.visualization.visType;
        var divId = "#dc-"+this.props.config.name;

        var domain = this.props.config.domain || [0,100];

        //Render according to chart-type
        switch(visType){
            case "pieChart":
                var c   = dc.pieChart(divId);
                c.width(210)
                .height(210).dimension(self.state.dimension)
                .group(self.state.group)
                .radius(90)
                .renderLabel(true);
                c.filterHandler(function(dimension, filters){
                  if(filters)
                    dimension.filter(filters);
                  else
                    dimension.filter(null);
                  return filters;
                });
                break;
            case "barChart":
                var c = dc.barChart(divId);
                c.width(250)
                    .height(160).dimension(self.state.dimension)
                    .group(self.state.group)
                    .x(d3.scale.linear().domain(domain))
                    .elasticY(true)
                    .elasticX(true)        
                    .renderLabel(true)

 
                    
                    c.filterHandler(function(dimension, filter){

                        var begin = $("#filterBeg"+dimension.name());
                        var end = $("#filterEnd"+dimension.name());
                        if(filter.length > 0 && filter.length!=2){
                           filter = filter[0]
                        }
                        begin.val(filter[0]);
                        end.val(filter[1]);
                        dimension.filter(filter);
                        return filter;
                    });
                break;
            case "rowChart":
                var c = dc.rowChart(divId);
                c.width(250)
                .height(200)
                .dimension(self.state.dimension)
                .group(self.state.group)
                .renderLabel(true)
                .elasticX(true)
                .margins({top: 10, right: 20, bottom: 20, left: 20});
                c.filterHandler(function(dimension, filters){
                    console.log(dimension);
                    console.log(filters);
                    if(filters)
                        dimension.filter(filters);
                    else
                        dimension.filter(null);
                    return filters;
                })     
        }
    },    

    render: function(){
        var divId = "dc-"+this.props.config.name;
        console.log(this.props.full)
        if(this.props.full == true){
            return (
                <div className="col-md-3">
                    <div className="chart-wrapper">
                        <div className="chart-title">
                          {this.props.config.name}
                        </div>
                        <div className="chart-stage">
                            <div  id={divId}> </div>
                        </div>
                        <div className="chart-notes">
                          Full view
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="col-md-12" onClick={this.fullView}>
                    <div className="chart-wrapper">
                        <div className="chart-title">
                          {this.props.config.name}
                        </div>
                        <div className="chart-stage">
                            <div  id={divId}> </div>
                        </div>
                        <div className="chart-notes">
                          Additional description here
                        </div>
                    </div>
                </div>
            );
        }

    }
});

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
                console.log(filteringAttribute);
                return (
                    <FilteringAttribute config={filteringAttribute}  full={self.state.full}/>
                );
            })    
        } else {
            filteringAttribute = <div></div>
        }
        if(this.state.full){
            return(
                <div  className="col-sm-12 fixed" id="interactiveFiltersPanel">
                    <h4> Filtering Attributes</h4>
                     <button onClick={this.fullView}>Filtering view</button>

                    <div>{filteringAttributes}</div>
                </div>
            );   

        } else {
            return(
                <div  className="col-sm-3 fixed" id="interactiveFiltersPanel">
                    <h4> Filtering Attributes</h4>
                     <button onClick={this.fullView}>Coordinated view</button>

                    <div>{filteringAttributes}</div>
                </div>
            );            
        }

    }
});

var DataTable = React.createClass({
    componentDidMount: function(){


        var self = this;
        console.log(filteredData.table_data.data);

        if(filteredData.table_data){
            console.log(filteredData.table_data.data);
            console.log(self.props.config.attributes)

            var columns = [];   
            var count=0;
            for(var i in self.props.config.attributes){
                columns[count] = {};
                //columns[count]["data"] = self.props.config.attributes[i].name;
                columns[count]["title"] = self.props.config.attributes[i].label || self.props.config.attributes[i].name;
                columns[count]["bSearchable"]= false;
                columns[count]["bSortable"] =false ;
                count++;
            }
            console.log(columns)
            dataTable = $('#vis').DataTable({
                bSort: false,
                bFilter: false,
                aoColumns: columns,
               
                "ajax": "dataTable/next",
                "processing": true,
                "serverSide": true,
                "scrollY": 420,
                "scrollX": true,
                 "pageLength": 100,
                columns: columns

            });   
        }

    },
    render: function(){
        var tableAttribtes = [];

         
            return(
                <table id="vis" className="display">

                </table>
            );
    }
});
var Visualization = React.createClass({
    render: function(){


        if(this.props.config){

            var visType = this.props.config.type;
            switch(visType){
                case "dataTable":
                    return(
                        <div id="visualization" className="col-sm-9">
                          <TabbedArea defaultActiveKey={1}>
                            <TabPane eventKey={1} tab='DataTable'>
                                <DataTable config={this.props.config} />
                            </TabPane>
                            <TabPane eventKey={2} tab='Visualization 2'>
                                <h3>Visualization</h3>
                            </TabPane>
                            <TabPane eventKey={3} tab='Vis 3'>
                                <h3>TabPane 3 content</h3>
                            </TabPane>
                          </TabbedArea>
                        </div>
                    );
                    break;
            }            
        }
        return (
            <div></div>
        );
    }
});


var Dashboard = React.createClass({

      componentDidMount: function(){      
        var self=this;    
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


                d3.json("/data?filter={}", function(d) {
                    filteredData = d;
                
                    self.setState({
                        interactiveFilters: interactiveFilters,
                        visualization: visualization,
                        currData: filteredData
                    });

                    dc.renderAll();

                }.bind(self));
            });
        });
      },
      getInitialState: function(){
        return {interactiveFilters: null, visualization: null, filter: null};
      },
      render: function(){
        return (
          <div>
            <InteractiveFilters config={this.state.interactiveFilters}>
            </InteractiveFilters>
            <Visualization config ={this.state.visualization}>
            </Visualization>
          </div>
        );
      }

});


React.render(<Dashboard />, document.getElementById("main"))