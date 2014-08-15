var dimensions = {};
var groups = {};
var thumbCharts = {};
var filteredData = {};
var visualizationMain = {};
var visualization = {};


init();
function init() {
    var interactiveFilters;
        
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
            //console.log(visualization);
            //console.log(interactiveFilters);
            refreshInit(interactiveFilters, visualization);

        });
    });
}



function refreshInit(interactiveFilters, visualization) {
    var filteringAttributes = [];
    var visualAttributes = [];
    var queryFilter = {};

    d3.json("/data?filter={}", function(d) {
        filteredData = d;
        processInteractiveFilters(interactiveFilters,filteringAttributes);
        processVisualization(visualization, visualAttributes);
        createButtons(filteringAttributes);
        initializeCrossfilter( filteringAttributes, queryFilter, visualAttributes);
    
        initializeThumbnails(filteringAttributes, thumbCharts);
        renderVisualizationInit( visualization, visualAttributes);

        /*
        * ###Listeners
        */
        $(".filterForm").keypress(function(e){
            if(e.which == 13){
                var dim = e.target.id;
                console.log(dim.id)
                dim = dim.substr(9, dim.length);
                
                var beg, end;
                beg = $("#filterBeg"+dim).val()*1;
                end = $("#filterEnd"+dim).val()*1;
                var f = [beg, end]
                console.log(f);
                thumbCharts[dim].filterAll()
                thumbCharts[dim].filter(f);

            }
        })
        dc.renderAll()
    });
}

function processInteractiveFilters(interactiveFilters, filteringAttributes) {
    //console.log(interactiveFilters)
    for (var i=0; i<interactiveFilters.length; i++) {
        var attribute = interactiveFilters[i];
        filteringAttributes.push(attribute);
    }
}
function processVisualization(visualization, visualAttributes) {
    //console.log("processVisualization")
    //console.log(visualization);
    var attributes = visualization.attributes;
    for (var i=0; i< attributes.length; i++) {
        var attribute = attributes[i];
        visualAttributes.push(attribute);
    }
}

function createButtons(filteringAttributes) {
    //console.log("createButtons")
    var $filteringAttributes = $("#filtering_attributes")
    for(var i=0; i<filteringAttributes.length; i++){
        var attribute = filteringAttributes[i];
        var attributeName = attribute["name"];
        var attributeLabel = attribute["label"] ? attribute["label"] : attribute["name"]
        var $accordianPanelHeader = '<div class="panel panel-default">\
                      <div class="panel-heading" id="'+attributeName+'-panel-heading">\
                        <div class=".col" style="width:100px float:left">\
                        <h4 class="panel-title">\
                          <a data-toggle="collapse" data-parent="#filtering_attributes" href="#'+attributeName+'-thumb">'+attributeLabel+'\
                          </a>\
                        </h4>\
                        </div>\
                        <div class="panel-heading-right">\
                            <div class="panel-form"></div>\
                            <a class="panel-reset" title="Reset filter" href="javascript:thumbCharts.'+attributeName+'.filterAll() " >X</a>\
                        </div>\
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
    //console.log("initializeCrossfilter")
    for (var i=0; i<filteringAttributes.length; i++) {
        var attributeName = filteringAttributes[i]["name"];
        dimensions[attributeName] = function() {
            var dim = attributeName;
            return {
                filter: function(f) {
               
                  if(f) {
                        queryFilter[dim] = f;
                        refresh(queryFilter, visualAttributes)
                  } else {
                      if(queryFilter[dim]){
                        delete queryFilter[dim];
                        refresh(queryFilter, visualAttributes)
                      } else {
                        return;
                      } 
                    }
                },

                filterAll: function() {
                    delete queryFilter[dim];
                    refresh(queryFilter, visualAttributes);
                },
                name: function(){
                    return dim;
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
    visualizationFilters(visualAttributes);
}

function visualizationFilters(visualAttributes){
    var dim;
    for(var attr in visualAttributes){
        var attribute = visualAttributes[attr];
        if(attribute.dimension)
            dim = attribute.name;
    }
    dimensions["visualization"] = function() {
            
             return {
                filter: function(f) {
                    if(f) {
                        queryFilter[dim] = f;
                        refresh(queryFilter, visualAttributes);
                        } 
                    else {
                            if(queryFilter[dim]) {
                                delete queryFilter[dim];
                                refresh(queryFilter, visualAttributes);
                            } else {
                                return;
                            }
                    }
                },
                filterAll: function() {
                        
                }
            }       
    }
    groups["visualization"] = function(){
        var dim = "visualization";
        var fData = filteredData[dim];
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
        

function initializeThumbnails(filteringAttributes, thumbCharts ) {
    //console.log("initializeThumbnails");
    //console.log(filteringAttributes)
    for (var i=0; i<filteringAttributes.length; i++) {
        //console.log(dimensions);
        //console.log(groups);
        var attribute = filteringAttributes[i];
        //console.log(attribute)
        var attributeName = attribute["name"];
        var domain = [0,100];
        var visualizationType = attribute["visualization"]["visType"];
        if(attribute["domain"])
            domain = attribute["domain"];
        var preFilter = "";

        //console.log(attributeName)

        switch(visualizationType) {
            case "barChart":
                thumbCharts[attributeName] = function() {

                    var aname = attributeName;
                    console.log(aname)
                    var c =  dc.barChart("#dc-"+aname+"-thumb");
                    c.width(250)
                    .height(160).dimension(dimensions[aname])
                    .group(groups[aname])
                    .x(d3.scale.linear().domain(domain))
                    .elasticY(true)
                    .elasticX(true)        

                    .renderLabel(true)
                    var panel = d3.select("#"+attributeName+"-panel-heading").select(".panel-form");
                    var begin = panel.append("input")
                                    .attr("id", "filterBeg"+attributeName)
                                    .attr("class", "filterForm");
                    var end = panel.append("input")
                                .attr("id", "filterEnd"+attributeName)
                                .attr("class", "filterForm");
                    //panel.append(form)
                    
                    c.filterHandler(function(dimension, filter){

                        var begin = $("#filterBeg"+dimension.name());
                        var end = $("#filterEnd"+dimension.name());
                        console.log(filter)
                        if(filter.length > 0 && filter.length!=2){
                           filter = filter[0]
                           console.log(filter)
                        }
                        begin.val(filter[0]);
                        end.val(filter[1]);
                        dimension.filter(filter);
                        return filter;
                    });

                    return c;
                }();
                createFilterForm(attributeName);
                //thumb_charts[i] = barChart(attributeName, preFilter, dimensions, groups);
                break;
            case "pieChart":
                thumbCharts[attributeName] = function() {
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
            case "rowChart":
                thumbCharts[attributeName] = function() {
                    var c = dc.rowChart("#dc-"+attributeName+"-thumb")
                    c.width(200)
                    .height(200)
                    .dimension(dimensions[attributeName])
                    .group(groups[attributeName])
                    
                    .renderLabel(true)
                    .elasticX(true)
                    .margins({top: 10, right: 20, bottom: 20, left: 20})

                    c.filterHandler(function(dimension, filters){
                        console.log(dimension);
                        console.log(filters);
                        if(filters)
                            dimension.filter(filters);
                        else
                            dimension.filter(null);
                        return filters;
                    })
                    return c;        
                }();
                break;
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


function renderVisualizationInit(visualization, visualAttributes) {
    var visualizationType = visualization.type;
    var visualizationHeading  = visualization.heading;
    var visualizationSubHeading = visualization.subheading;
    var visualizationDiv = d3.select("#visualization");
    visualizationDiv.append("h1")
        .html(visualizationHeading);
    visualizationDiv.append("h3")
        .html(visualizationSubHeading);

    switch (visualizationType) {
        case "dataTable":
            renderTableInit(visualAttributes);
            break;
        case "barChart":
            renderBarChartInit(visualAttributes);
            break;
        case "bubbleChart":
            renderBubbleChartInit(visualAttributes);
            break;
        case "imageGrid":
            renderImageGridInit(visualAttributes);
            break;
    }

}

function renderVisualization(visualAttributes) {
    //console.log(visualAttributes)
    var visualizationType = visualization.type;
    console.log(visualizationType);
    switch (visualizationType) {
        case "dataTable":
            console.log("refresh")
            renderTable(visualAttributes);
            break;
        case "barChart":
            //renderBarChartInit(visualAttributes);
            break;
        case "bubbleChart":
            //renderBubbleChartInit(visualAttributes);
            break;
        case "imageGrid":
            renderImageGrid(visualAttributes);
            break;
    }
}




function refresh(queryFilter, visualAttributes) {
    if(JSON.stringify(queryFilter)) {
        for (qf in queryFilter) {
            if(queryFilter[qf].length === 0) {
                delete queryFilter[qf];
            }
        }
        d3.json("/data?filter="+JSON.stringify(queryFilter), function (d) {
            filteredData = d;
            console.log(filteredData)
            //console.log(filteredData);
            dc.renderAll();

            renderVisualization(visualAttributes);
        });
        } else {
            
        }
}

function createFilterForm(attributeName) {
    var $panelHeading = $("#"+attributeName+"-panel-heading");

    //incomplete
}
    

