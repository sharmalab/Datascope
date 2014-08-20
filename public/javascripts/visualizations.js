
function renderImageGridInit(visualAttributes){
    var $visualization = d3.select("#visualization");
    $activeRecords = $visualization.append("div")
        .attr("id", "activeRecords");
    $activeRecords.append("div")
        .attr("id", "nActive")
        .text(filteredData["visualization"]["active"]);
    $activeRecords.append("div")
        .attr("id", "nSize")
        .text(" of "+filteredData["visualization"]["size"] + " selected")



    var $grid = $visualization.append("table")
                    .attr("id", "grid");
    var $tbody = $grid.append("tbody");

    //var rawData = filteredData["visualization"];
    var rawData = [];
    for(var a in filteredData["visualization"]){
        var d = filteredData["visualization"][a];
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
    .data(function(d) {
        return d3.values(d);
    })
    .enter()
    .append("td")
    .html(function(d) {
        var img = "<img style='border: 1px solid #fff' src='"+d+"' />"
        return img;
    });
    
}

function renderImageGrid(visualAttributes){
    var $nActive = d3.select("#nActive")
    $nActive.text(filteredData["visualization"]["active"] );

    var $grid = d3.select("#grid");
    var $tbody = $grid.select("tbody");
    $tbody.html("");
    var rawData = [];
    for(var a in filteredData["visualization"]){
        var d = filteredData["visualization"][a];
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
    .data(function(d) {
        return d3.values(d);
    })
    .enter()
    .append("td")
    .html(function(d) {
        var img = "<img style='border: 1px solid #fff' src='"+d+"' />"
        return img;
    });
    
}


function renderBarChartInit(visualAttributes){
    var $visualization = d3.select("#visualization");
    var $visBarChart = $visualization.append("div")
        .attr("id", "visBarChart")
    visBarChart = dc.barChart($visBarChart);

    for (var i=0; i<visualAttributes.length; i++) {
        var attributeName = visualAttributes[i]["name"];
        dimensions[attributeName] = function() {
            var dim = attributeName;
            return {
                filter: function(f) {
                    if(f) {
                        queryFilter[dim] = f;
                        refresh(queryFilter, visualAttributes);
                        } else {
                            if(queryFilter[dim]) {
                                delete queryFilter[dim];
                                refresh(queryFilter, visualAttributes);
                            } else {
                                return;
                            }
                        }
                },
                filterAll: function() {
                        
                },
                filterFunction: function(d) {
                        
                }
            }
        }();
        groups[attributeName] = function() {
            var dim = attributeName;
            var fData = filteredData[dim]
            return {
                all: function() {
                    return filteredData[dim].values;
                },
                order: function() {
                    return groups[dim];
                },
                top: function() {
                    return filteredData[dim].values;
                }
            }
        }();
    }

    visBarChart.width(600)
        .height(500)
        .dimension(dimensions[visualAttributes[0]["name"]])
        .group(groups[visualAttributes[0]["name"]])
        .x(d3.scale.linear().domain([0,10]))
}


function renderBubbleChartInit(visualAttributes){
    var $visualization = d3.select("#visualization");
    var $bubbleChartDiv = $visualization.append("div")
        .attr("id", "bubbleChartDiv")
    visBubbleChart = dc.bubbleChart("#visualization");

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

}


function drawTable(tableData, state, visualAttributes){
    var $visualization = d3.select("#visualization")
    var $table = d3.select("#dataTable");
    var $tbody = $table.select("tbody");
    $tbody.html("");

    var rows = $tbody.selectAll("tr")
    .data(tableData)
    .enter()
    .append("tr")
    var cells = rows.selectAll("td")
    .data(function(d) {
        return d3.values(d);
    })
    .enter()
    .append("td")
    .text(function(d) {return d;});

    var next = $("#dataTableNext");
    var prev = $("#dataTablePrev");
    console.log(state);
    console.log(tableData.length)
    if(state <= 1){
        console.log("here")
        prev.hide();
    }else
        prev.show()
    if(tableData.length < 100){
        next.hide();
    }else{
        next.show();
    }
    var $nActive = d3.select("#nActive")
    $nActive.text(filteredData["table_data"]["active"] );






}

function renderTableInit(visualAttributes) {
    var $visualization = d3.select("#visualization");

    $activeRecords = $visualization.append("div")
        .attr("id", "activeRecords");
    $activeRecords.append("div")
        .attr("id", "nActive")
        .text(filteredData["table_data"]["active"]);
    $activeRecords.append("div")
        .attr("id", "nSize")
        .text(" of "+filteredData["table_data"]["size"] + " selected")




    var $table = $visualization.append("table")
    .attr("id", "dataTable")
    .attr("class", "table")
    var $thead = $table.append("thead");
    var $tbody = $table.append("tbody");
    var tableData = [];
    var columns = [];
    //Get data
    var rawTableData = filteredData["table_data"]["data"];
    for (var attribute in rawTableData) {
        var row = rawTableData[attribute];
        var newRow = {};
        for (var visualAttribute in visualAttributes) {
            newRow[visualAttributes[visualAttribute]["name"]] = row[visualAttributes[visualAttribute]["name"]];
        }
        tableData.push(newRow);
    }
    Object.keys(tableData[0]).forEach(function(column) {
        columns.push(column)
    });
    $thead.html("");
    $thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function(column) {return column;});


    drawTable(tableData, 0,visualAttributes);


    //Next and previous

    var $dataTableNav = $visualization.append("div")
            .attr("id", "dataTableNav")


    $dataTableNav.append("a")
        .attr("href", "#")
        .attr("id", "dataTablePrev")
        .text("<< prev");
    var prev = $("#dataTablePrev");
    prev.hide()
    prev.click(function(e){
        if(state > 1){
            state--;
            $.get("/dataTable/next?state="+state, function(rawTableData){

                var $table = d3.select("#dataTable");
                var $tbody = $table.select("tbody");
                $tbody.html("");
                var rawTableData = rawTableData["table_data"]["data"];    
                var tableData = [];              
                for (var attribute in rawTableData) {
                    var row = rawTableData[attribute];
                    var newRow = {};
                    for (var visualAttribute in visualAttributes) {
                        newRow[visualAttributes[visualAttribute]["name"]] = row[visualAttributes[visualAttribute]["name"]];
                    }
                    tableData.push(newRow);
                }
                //var state = rawTableData.state;
                drawTable(tableData, state, visualAttributes)
        
            })
        }
    })




    $dataTableNav.append("a")
        //.attr("href", "/dataTable/next")
        .attr("href", "#")
        .attr("id", "dataTableNext")
        .text("next >>");
    var next = $("#dataTableNext");
    var state=1;
    next.click(function(e){
        state++;
        $.get("/dataTable/next?state="+state, function(rawTableData){

            var $table = d3.select("#dataTable");
            var $tbody = $table.select("tbody");
            $tbody.html("");
            var rawTableData = rawTableData["table_data"]["data"];    
            var tableData = [];              
            for (var attribute in rawTableData) {
                var row = rawTableData[attribute];
                var newRow = {};
                for (var visualAttribute in visualAttributes) {
                    newRow[visualAttributes[visualAttribute]["name"]] = row[visualAttributes[visualAttribute]["name"]];
                }
                tableData.push(newRow);
            }
            //var state = rawTableData.state;
            drawTable(tableData, state, visualAttributes)
    
        })
    })

}

function renderTable(visualAttributes) {
    var $table = d3.select("#dataTable");
    var $tbody = $table.select("tbody");
    $tbody.html("");
    var tableData = [];
    
    //Get data
    var rawTableData = filteredData["table_data"]["data"];
    
    for (var attribute in rawTableData) {
        var row = rawTableData[attribute];
        var newRow = {};
        for (var visualAttribute in visualAttributes) {
            newRow[visualAttributes[visualAttribute]["name"]] = row[visualAttributes[visualAttribute]["name"]];
        }
        tableData.push(newRow);
    }

    drawTable(tableData,0, visualAttributes)
    
}
    