var TabbedArea      = ReactBootstrap.TabbedArea,
    TabPane         = ReactBootstrap.TabPane,
    Button          = ReactBootstrap.Button;
var filteredData = {};
var queryFilter = {};
var dataTable;

var AppActions = require("./actions/AppActions.jsx");
var AppStore = require("./stores/AppStore.jsx");
/*
function refresh() {
    if(JSON.stringify(queryFilter)) {
        for (qf in queryFilter) {
            if(queryFilter[qf].length === 0) {
                delete queryFilter[qf];
            }
        }
        d3.json("/data?filter="+JSON.stringify(queryFilter), function (d) {
            filteredData = d;

            if(dataTable.ajax){  
                dataTable.ajax.reload();
            }
            dc.renderAll();
        });
        } else {
            
        }
}

*/

var FilteringAttribute = React.createClass({
    componentWillMount: function(){
     //Initialize crossfilter dimensions and groups before rendering

        var attributeName = this.props.config.name;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        //refresh()

                        AppActions.refresh();
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];

                        //here would call the update action
                        //refresh();
                        AppActions.refresh();
                      } else {
                        return;
                      } 
                    }
                },
            filterAll: function() {
                    delete queryFilter[attributeName];

                    AppActions.refresh();
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
                c.width(250)
                .height(190).dimension(self.state.dimension)
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
                    .height(190).dimension(self.state.dimension)
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
                .height(190)
                .dimension(self.state.dimension)
                .group(self.state.group)
                .renderLabel(true)
                .elasticX(true)
                .margins({top: 10, right: 20, bottom: 20, left: 20});
                c.filterHandler(function(dimension, filters){
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

var DataTable = React.createClass({
    componentDidMount: function(){


        var self = this;



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
  

    },
    render: function(){
        var tableAttribtes = [];

         
            return(
                <table id="vis" className="display">

                </table>
            );
    }
});



var BubbleChart = React.createClass({
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
        var config = this.props.config;

        var visualAttributes = this.props.config.attributes;
        var xAttr;
        var yAttr;
        var rAttr;
        var colorAttr;
        for (var i=0; i<visualAttributes.length; i++) {
            attribute = visualAttributes[i];

            if(attribute.type == "x"){
                xAttr = attribute.name;
            }
            if(attribute.type == "y"){
                yAttr = attribute.name;
            }
            if(attribute.type == "r"){
                rAttr = attribute.name;
            }
            if(attribute.type == "color"){
                colorAttr = attribute.name;
            }    
        }
        visBubbleChart = dc.bubbleChart("#vis");

        visBubbleChart.width(900)
            .height(400)
            .dimension(dimensions["visualization"])
            .group(groups["visualization"])
            .maxBubbleRelativeSize(0.4)       
            .margins({top: 50, right: 50, bottom: 30, left: 40})
            .colors(colorbrewer.RdYlGn[9]) // (optional) define color function or array for bubbles
            .colorAccessor(function(d){
                return d.value[colorAttr];
            })
            .radiusValueAccessor(function(d){
                return d.value[rAttr]/100000;
            })
            .keyAccessor(function(d){
                return d.value[xAttr];
            })
            .valueAccessor(function(d){
                return d.value[yAttr];
            })
            .x(d3.scale.linear().domain([0, 100]))
            .y(d3.scale.linear().domain([0, 10]))
            .r(d3.scale.linear().domain([0, 10]))
            .elasticY(true)
            .elasticX(true)
            .yAxisPadding(100)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
            .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false


        },
    render: function(){
        return(
            <div id="vis">

            </div>
        )
    }

});

var HeatMap = React.createClass({
    getInitialState: function(){
        return({dimension: null, group: null})
    },
    componentWillMount: function(){



    },

    componentDidMount: function(){
        var self = this;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        refresh();
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
                return filteredData["heatMapGroup"].values;
            },
            order: function() {
                return groups["heatMapGroup"];
            },
            top: function() {
                return filteredData["heatMapGroup"].values;
            }
        };

        var config = self.props.config.attributes;
        for (var i=0; i<config.length; i++) {

            attribute = config  [i];
            if(attribute.type == "x"){
                xAttr = attribute.name;
            }
            if(attribute.type == "y"){
                yAttr = attribute.name;
            }    
        }       
        console.log(dim) 

        var heat = dc.heatMap("#heatVis");
        heat.width(45 * 20 + 20)
        .height(45 * 5+260 )
        .dimension(dim)
        .group(group)
        .keyAccessor(function(d) { return +d.key[0]; })
        .valueAccessor(function(d) { return +d.key[1]; })
        .colorAccessor(function(d) { return +d.value; })
        .title(function(d) {
            return "AgeatInitialDiagnosis:   " + d.key[0] + "\n" +
                   "KarnofskyScore:  " + d.key[1] + "\n" +
                   "Total: " + ( + d.value);})
        .colors(["#ffffff","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
        .calculateColorDomain(); 
        //heat.render()  
        console.log(heat)

    },
    render: function(){

        console.log(this.props.config);
        return(
            
            <div id="heat">
                <h2>{this.props.config.heading}</h2>
                <h4>{this.props.config.subheading}</h4>
                <div id="heatVis"></div>
             </div>
        );
    }
});


var ImageGrid = React.createClass({
    componentDidMount: function(){

        var $visualization = d3.select("#imageGrid");
        console.log(filteredData)
        $activeRecords = $visualization.append("div")
            .attr("id", "activeRecords");
            /*
        $activeRecords.append("div")
            .attr("id", "nActive")
            .text(filteredData["imageGrid"]);
        $activeRecords.append("div")
            .attr("id", "nSize")
            .text(" of "+filteredData["imageGrid"]["size"] + " selected")
            */  


        var $grid = $visualization.append("table")
                        .attr("id", "grid");
        var $tbody = $grid.append("tbody");

        //var rawData = filteredData["visualization"];
        var rawData = [];
        for(var a in filteredData["imageGrid"]){
            var d = filteredData["imageGrid"][a];
            for(var obj in d){
                var o = d[obj];
                var i = o["image"];
                rawData.push(i);
            }
        }
        var gridData = [];
        while(rawData.length){
            gridData.push(rawData.splice(0,10));
        }

        var rows = $tbody.selectAll("tr")
        .data(gridData)
        .enter()
        .append("tr")
        var cells = rows.selectAll("td")
        .style({"width": "40px"})
        .data(function(d) {
            return d3.values(d);
        })
        .enter()
        .append("td")
        .html(function(d) {
            var img = "<img style='border: 1px solid #fff' width='100' src='"+d+"' />"
            return img;
        });

    },
    handleRefresh: function(){
        console.log('refresh')
    },  
    
    render: function(){
        return(
            <div id="imageGrid" ></div>
        );
    }
})

var Visualization = React.createClass({
    render: function(){
        var visType = this.props.config.type;

        switch(visType){
            case "dataTable":
                return(
                    <DataTable config={this.props.config} />
                );
                break;
            case "bubbleChart":
                return(
                    <div></div>

                );
                break;
            case "heatMap":
                return(
                    <HeatMap config={this.props.config} />
                );
            case "imageGrid":
                return(
                    <ImageGrid config={this.props.config} />

                );
            default:
                return(
                    <div></div>
                );
        }         
          
    }

});

var Visualizations = React.createClass({
    render: function(){


        if(this.props.config){

            var count=0;
            var visualizations = this.props.config.map(function(visualization){

                count++;   
                return(
                    <TabPane tab={visualization.type} eventKey={count}>
                        <Visualization config ={visualization}  />
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
                
                    console.log(filteredData);

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
      handleRefresh: function(filteredData){
        this.setState({currData: filteredData})
      },
      onFilter: function(){

      },
      render: function(){
        return (
          <div>
            <InteractiveFilters onFilter={this.onFilter} config={this.state.interactiveFilters}>
            </InteractiveFilters>
            <Visualizations config ={this.state.visualization} onRefresh={this.handleRefresh} currData={this.state.currData}>
            </Visualizations>
          </div>
        );
      }

});


React.render(<Dashboard />, document.getElementById("main"))
