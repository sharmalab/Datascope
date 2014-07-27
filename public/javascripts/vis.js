var queryFilter = {}
var chartData = {}


var filtering_attributes = [];
var visual_attributes = [];
var attributes = [];
var schema_data = {};




dimensions = {};
thumb_dimensions = {};
groups = {};
thumb_groups = {};
charts = [];
thumb_charts = [];


init();

function init(){
  d3.json("schemas/interactiveFilters.json", function(err, data){
    var interactive_filters = data;    refresh_init(interactive_filters);
  });
}



function refresh_init(interactive_filters) {
  d3.json("/data?filter="+JSON.stringify(queryFilter), function (d){
    chartData = d;

    process_interactive_filters(interactive_filters);
    create_buttons();
    initialize_dimensions();
    initialize_thumbnails();


    dc.renderAll(); 
  })
}


function process_interactive_filters(interactive_filters){  
  for(var index in interactive_filters){
    var attribute = interactive_filters[index];
    attributes.push(attribute);
    filtering_attributes.push(attribute);
  }
}

function create_buttons(){
  var filtering_attributes_div = $("#filtering_attributes")
  for(var i=0; i<filtering_attributes.length; i++){
    var attribute_name = filtering_attributes[i]["name"];
    var accordian_panel_header = '<div class="panel panel-default">\
                  <div class="panel-heading">\
                    <h4 class="panel-title">\
                      <a data-toggle="collapse" data-parent="#filtering_attributes" href="#'+attribute_name+'-thumb">'+attribute_name+'\
                      </a>\
                    </h4>\
                  </div>'
    var accordian_panel_body = '<div id="'+attribute_name+'-thumb" class="panel-collapse collapse in">\
                    <div class="panel-body thumb-panel-body"  data-toggle="modal" data-target="#'+attribute_name+'Modal">\
                      <div id="dc-'+attribute_name+'-thumb" class="thumb-chart"></div>\
                    </div>\
                  </div>\
                </div>'
    var accordian_full = accordian_panel_header + accordian_panel_body
    //var button = "<button id='button' class='btn btn-default' type='button' data-toggle='modal' data-target='#"+attribute_name+"Modal'>"+ attribute_name + "</button>";
    filtering_attributes_div.append(accordian_full);
  }
}

function  initialize_dimensions () {
  for(var i in filtering_attributes){
    var attribute_name = filtering_attributes[i]["name"];
    dimensions[attribute_name] = function(dim){
      var dim = attribute_name;
      return {
        filter: function(f) {
          if(f) {
                queryFilter[dim] = f;
                refresh()
          } else {
              if(queryFilter[dim]){
                delete queryFilter[dim];
                refresh()
              } else {
                return;
              } 
          }
        }, 
        filterAll: function(){

        },
        filterFunction: function(d){

        }
      }
    }();
    groups[attribute_name] = function(dim){
      var dim =attribute_name;
      return {
            all: function(){
              return chartData[dim].values
            }, 
            order: function(){
              return groups[dim]
            },
            top: function(){
              return chartData[dim].values
            }
      }
    }();
  }
}

function initialize_thumbnails(){
  for(var i in filtering_attributes){
    var attribute_name = filtering_attributes[i]["name"];
    var domain = [0,100];
    var visualization_type = filtering_attributes[i]["visualization"]["visType"];
    if(filtering_attributes[i]["domain"]){
      domain = filtering_attributes[i]["domain"]
    }
    if(visualization_type == "barChart"){
      thumb_charts[i] = function(aname,pre_filter) {
        aname = attribute_name;
        pf = pre_filter;
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
    } else if(visualization_type == "pieChart") {
      thumb_charts[i] = function(aname) {
        aname = attribute_name;
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
    } else {
      thumb_charts[i] = function(aname) {
        aname = attribute_name;
        var c =  dc.rowChart("#dc-"+aname+"-thumb");
        c.width(200)
        .height(160).dimension(dimensions[aname])
        .group(groups[aname])
        .elasticX(true)
        .margins({top: 10, right: 20, bottom: 20, left: 10})

        c.filterHandler(function(dimension, filters){
          if(filters)
            dimension.filter(filters);
          else
            dimension.filter(null);
          return filters;
        })
        return c;
        }();           
    }
  } 
}


function refresh() {
  if(JSON.stringify(queryFilter)){
    console.log(queryFilter)
    for(qf in queryFilter){
      if(queryFilter[qf].length === 0){
        delete queryFilter[qf];
      }
    }
    d3.json("/data?filter="+JSON.stringify(queryFilter), function (d){
      chartData = d;
      dc.renderAll();
    });
  } else {

  }
}

