
var ImageGrid = React.createClass({
    componentDidMount: function(){
        var self = this;
        var $visualization = d3.select("#imageGrid");

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
        //var filteredData = AppStore.getData();
        console.log("grid...")
        console.log(self.props);
        var filteredData = self.props.currData;

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
            gridData.push(rawData.splice(0,8));
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
    componentDidUpdate: function(){
        var self = this;
        var $visualization = d3.select("#imageGrid");
        $visualization.html("")
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
        //var filteredData = AppStore.getData();
        console.log("grid...")
        console.log(self.props);
        var filteredData = self.props.currData;

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
            gridData.push(rawData.splice(0,8));
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
    
    render: function(){
        return(
            <div id="imageGrid" ></div>
        );
    }
});

module.exports = ImageGrid;
