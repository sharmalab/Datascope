var queryFilter = {};
var AppActions = require("../actions/AppActions.jsx");
var FilteringAttribute = React.createClass({
    componentWillMount: function(){
     //Initialize crossfilter dimensions and groups before rendering
        var self = this;
        var attributeName = this.props.config.name;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        //refresh()

                        AppActions.refresh(queryFilter);
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];

                        //here would call the update action
                        //refresh();
                        AppActions.refresh(queryFilter);
                      } else {
                        return;
                      } 
                    }
                },
            filterAll: function() {
                    delete queryFilter[attributeName];

                    AppActions.refresh(queryFilter);
                },
            name: function(){
                    return attributeName;
                }
       
        };
        var group = {
                all: function() {
                    //console.log(AppStore.getData())
                    //return self.props.currData;
                    return self.props.currData[attributeName].values;
                    /*
                    if(AppStore.getData()[attributeName]){
                        return AppStore.getData()[attributeName].values;   
                    }
                    
                    return filteredData[attributeName].values;
                    */
                },
                order: function() {
                    return groups[attributeName];
                },
                top: function() {
                    return self.props.currData[attributeName].values;
                    /*
                    if(AppStore.getData()[attributeName]){
                        return AppStore.getData()[attributeName].values;   
                    }
                    
                    //console.log(AppStore.getData())
                    //return AppStore.getData()[attributeName].values;
                    return filteredData[attributeName].values;
                    */
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
module.exports = FilteringAttribute;