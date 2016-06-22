var React = require("react");

var ChartAddons = React.createClass({
    getInitialState: function(){
        return {elasticY: true, elasticX: true};
    },
    filter: function(e){
        var self = this;
        var c = self.props.chart;
        if(e.keyCode == 13){
            //console.log(this.props.chart);
            var f = [self.state.beg, self.state.end];
            c.filterAll();
            c.filter(f);
        }

    },
    handleBeg: function(event){
        this.setState({beg: event.target.value});
    },
    handleEnd: function(event){
        this.setState({end: event.target.value});
    },

    handleElasticX: function(){
        var c = this.props.chart;
        //console.log("handle checkbox..");
        //console.log((this.state.elasticY));
        //var queryFilterBackup = queryFilter;
        //c.elasticY(true);
        //AppActions.refresh({});
        //console.log(queryFilter);

        if(this.state.elasticX === true){

            c.elasticX(false);

        } else {
            //Elastic axis
            c.elasticX(true);
        }
        //AppActions.refresh(queryFilter);

        //c.elasticY(false);
        c.filterAll();
        dc.renderAll();
        this.setState({elasticX: !this.state.elasticX});

    },
    handleElasticY: function(){
        var c = this.props.chart;
        //console.log("handle checkbox..");
        //console.log((this.state.elasticY));
        //var queryFilterBackup = queryFilter;
        //c.elasticY(true);
        //AppActions.refresh({});

        //console.log(queryFilter);

        if(this.state.elasticY === true){

            c.elasticY(false);

        } else {
            //Elastic axis
            c.elasticY(true);
        }
        //AppActions.refresh(queryFilter);

        //c.elasticY(false);
        c.filterAll();
        dc.renderAll();
        this.setState({elasticY: !this.state.elasticY});

    },
    handleInvertSelection: function(event) {
        console.log(this.props.config.attributeName);
        var attributeName = this.props.config.attributeName;
        var c = this.props.chart;
        var availableFilters = (this.props.data[attributeName].values);
        var currentFilter = queryFilter[attributeName];
        //console.log("current filter");
        //console.log(currentFilter);
        var invertedFilter = [];
        for(var i in availableFilters){
            var filter = availableFilters[i].key;
            var flag = true;
            for(var j in currentFilter){
                if(filter === currentFilter[j])
                    flag = false;
            }
            if(flag)
                invertedFilter.push(filter);
            /*
            //console.log(filter.key +" " + currentFilter);
            if(currentFilter != filter.key){
                //console.log('false');
                invertedFilter.push(filter.key)
            }
            */
        }
        //console.log(invertedFilter);
        c.filter(null);
        c.filter(invertedFilter);
        ////c.filter({invert: invertedFilter});
        //console.log("filtered! woot");
    },
    render: function(){
        var visType = this.props.config.visualization.visType;
        var isFilterActive = this.props.isFilterActive; 
        //console.log(isFilterActive);
        switch(visType){
        case  "barChart":
            return(
                    <div>
                    <div className="chartAddons">
                        <label>
                        Range:
                        <input type="text" onChange={this.handleBeg} onKeyDown={this.filter} id={"filterBeg"+this.props.config.attributeName}/>
                        -
                        <input type="text" onChange={this.handleEnd} onKeyDown={this.filter} id={"filterEnd"+this.props.config.attributeName}/>
                        </label>
                    </div>
                    <div className="chartAddons">
                        <label>
                        ElasticY:
                        <input type="checkbox"  onChange={this.handleElasticY}  checked={this.state.elasticY}/>
                        </label>
                    </div>
                    </div>
                );
        case "rowChart":
            return(
                    <div className="chartAddons">

                        <label>
                        ElasticX:
                        <input type="checkbox" onChange={this.handleElasticX} checked={this.state.elasticX}/>
                        </label>
                        <br />
                        {isFilterActive ?
                        
                        <button onClick={this.handleInvertSelection}>Invert Selection</button>
                        :
                            <div />
                        }
                        
                   </div>
                );
        default:
            return(
                    <div></div>
                );
        }

    }
});

module.exports = ChartAddons;