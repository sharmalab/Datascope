var dimensions = {};
var groups = {};
var thumbCharts = [];
var filteredData = {}


init();
function init() {
    var interactiveFilters,
        visualization;
    d3.json("schemas/interactiveFilters.json", function(err, data) {
        if(err) {
            console.log(err);
            return;
        }
        interactiveFilters = data;
        d3.json("schemas/visualization.json", function(err, data) {
            if(err) {
                console.log(err);
                return;
            }
            visualization = data;
            console.log(visualization);
            console.log(interactiveFilters);
            refreshInit(interactiveFilters, visualization);
        });
    });
}



function refreshInit(interactiveFilters, visualization) {
    var filteringAttributes = [];
    var visualAttributes = [];
    var queryFilter = {};

    d3.json("/data?filter={}", function(d) {
        console.log("refreshInit()")
        filteredData = d;
        console.log(filteredData)
        processInteractiveFilters(interactiveFilters,filteringAttributes);
        processVisualization(visualization, visualAttributes);
        console.log("creating button")
        createButtons(filteringAttributes);
        initializeCrossfilter( filteringAttributes, queryFilter,  visualAttributes);
        console.log(filteringAttributes)
        initializeThumbnails(filteringAttributes, thumbCharts);
        renderVisualizationInit( visualAttributes);
        dc.renderAll()
    });
}

function processInteractiveFilters(interactiveFilters, filteringAttributes) {
    console.log(interactiveFilters)
    for (var i=0; i<interactiveFilters.length; i++) {
        var attribute = interactiveFilters[i];
        filteringAttributes.push(attribute);
    }
}
function processVisualization(visualization, visualAttributes) {
    console.log("processVisualization")
    console.log(visualization);
    var attributes = visualization.attributes;
    console.log(attributes);
    for (var i=0; i< attributes.length; i++) {
        var attribute = attributes[i];
        visualAttributes.push(attribute);
    }
}

function createButtons(filteringAttributes) {
    console.log("createButtons")
    var $filteringAttributes = $("#filtering_attributes")
    for(var i=0; i<filteringAttributes.length; i++){
        var attribute = filteringAttributes[i];
        var attributeName = attribute["name"];
        var attributeLabel = attribute["label"] ? attribute["label"] : attribute["name"]
        var $accordianPanelHeader = '<div class="panel panel-default">\
                      <div class="panel-heading">\
                        <h4 class="panel-title">\
                          <a data-toggle="collapse" data-parent="#filtering_attributes" href="#'+attributeName+'-thumb">'+attributeLabel+'\
                          </a>\
                        </h4>\
                      </div>'
        var $accordianPanelBody = '<div id="'+attributeName+'-thumb" class="panel-collapse collapse in">\
                        <div class="panel-body thumb-panel-body"  data-toggle="modal" data-target="#'+attributeName+'Modal">\
                          <div id="dc-'+attributeName+'-thumb" class="thumb-chart"></div>\
                        </div>\
                      </div>\
                    </div>'
        var $accordianFull = $accordianPanelHeader + $accordianPanelBody;
        //var button = "<button id='button' class='btn btn-default' type='button' data-toggle='modal' data-target='#"+attribute_name+"Modal'>"+ attribute_name + "</button>";
        $filteringAttributes.append($accordianFull);
    }
}
function initializeCrossfilter(filteringAttributes, queryFilter, visualAttributes) {
    console.log("initializeCrossfilter")
    for (var i=0; i<filteringAttributes.length; i++) {
        var attributeName = filteringAttributes[i]["name"];
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
                    console.log(filteredData[dim].values);
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
}
        

function initializeThumbnails(filteringAttributes, thumbCharts ) {
    console.log("initializeThumbnails");
    console.log(filteringAttributes)
    for (var i=0; i<filteringAttributes.length; i++) {
        console.log(dimensions);
        console.log(groups);
        var attribute = filteringAttributes[i];
        console.log(attribute)
        var attributeName = attribute["name"];
        var domain = [0,100];
        var visualizationType = attribute["visualization"]["visType"];
        if(attribute["domain"])
            domain = attribute["domain"];
        var preFilter = "";

        console.log(attributeName)

        switch(visualizationType) {
            case "barChart":
                thumbCharts[i] = function() {

                    var aname = attributeName;
                    console.log(aname)
                    var c =  dc.barChart("#dc-"+aname+"-thumb");
                    c.width(240)
                    .height(160).dimension(dimensions[aname])
                    .group(groups[aname])
                    .x(d3.scale.linear().domain(domain))
                    .elasticY(true)
                    .elasticX(true)
                    .renderLabel(true)
                    return c;
                }();

                //thumb_charts[i] = barChart(attributeName, preFilter, dimensions, groups);
                break;
            case "pieChart":
                thumbCharts[i] = function() {
                    aname = attributeName;
                    var c =  dc.pieChart("#dc-"+aname+"-thumb");
                    c.width(180)
                    .height(180).dimension(dimensions[aname])
                    .group(groups[aname])
                    .radius(90)
                    .renderLabel(true);
                    c.filterHandler(function(dimension, filters){
                      if(filters)
                        dimension.filter(filters);
                      else
                        dimension.filter(null);
                      return filters;
                    })
                    return c;
                }();      
                break;
            case "lineChart":
                thumbCharts[i] = function() {
                    var c = dc.lineChart("#dc-"+attributeName+"-thumb");

                }
        }
    }
}


function barChart(attributeName, preFilter, dimensions, groups) {
    console.log("");
    var bc = function(){
        var c =  dc.barChart("#dc-"+aname+"-thumb");
        c.width(240)
        .height(160).dimension(dimensions[aname])
        .group(groups[aname])
        .x(d3.scale.linear().domain(domain))
        .elasticY(true)
        .elasticX(true)
        .renderLabel(true);
        return c;

    }();
    return bc;
}
function pieChart(attributeName, preFilter, dimensions, groups) {
    var aname = attributeName;
    var c =  dc.pieChart("#dc-"+aname+"-thumb");
    c.width(180)
    .height(180).dimension(dimensions[aname])
    .group(groups[aname])
    .radius(90)
    .renderLabel(true);
    
    c.filterHandler(function(dimension, filters) {
        if(filters)
        dimension.filter(filters);
        else
        dimension.filter(null);
        return filters;
    })
    return c;
}

function renderVisualizationInit(visualAttributes) {
    renderTableInit(visualAttributes);
}

function renderVisualization(visualAttributes) {
    console.log(visualAttributes)
    renderTable(visualAttributes);
}



function refresh(queryFilter, visualAttributes) {
    if(JSON.stringify(queryFilter)) {
        console.log(queryFilter)
        for (qf in queryFilter) {
            if(queryFilter[qf].length === 0) {
                delete queryFilter[qf];
            }
        }
        d3.json("/data?filter="+JSON.stringify(queryFilter), function (d) {
            filteredData = d;
            console.log(filteredData);
            dc.renderAll();

            renderVisualization(visualAttributes);
        });
        } else {
            
        }
}
    



///////////////////////////////
///////////////////////////////
///////////////visualization.js
///////////////////////////////
///////////////////////////////

function renderTableInit(visualAttributes) {
    
    var $visualization = d3.select("#visualization");
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
    $tbody.html("");
    $thead.html("");
    $thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function(column) {return column;});
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
    
}
    