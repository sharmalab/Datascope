var queryFilter = {}
var chartData = {}

var table_data = [];


var datatable = d3.select("#dataTable"),
  thead = datatable.append("thead"),
  tbody = datatable.append("tbody");
function render_table(){
  var columns = [];
  Object.keys(table_data[0]).forEach(function(col){
    //console.log(col);
    columns.push(col);
    //console.log(columns);
  })
  //console.log(tbody);
  tbody.html("");
  thead.html("")
  thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function(column){return column;})
  var rows = tbody.selectAll("tr")
    .data(table_data)
    .enter()
    .append("tr");
  var cells = rows.selectAll("td")
    .data(function(d){
      //console.log(d3.values(d));
       return d3.values(d)})
    .enter()
    .append("td")
    .text(function(d){return d;})
  //console.log("here")

}

function refresh() {
  table_data= [];
  d3.json("/data?filter="+JSON.stringify(queryFilter), function (d){

    chartData = d;
    console.log(chartData);

    //Delete later
      total_data = chartData["table_data"]["data"]
      for(var attr in total_data){

        //console.log(total_data[attr])
        var row = total_data[attr]
        var new_row={}
        for(var vattr in visual_attributes){
          new_row[visual_attributes[vattr]["name"]]=row[visual_attributes[vattr]["name"]]
        }
        table_data.push(new_row)
      }
    render_table()
    dc.renderAll();
  })
}

function refresh_init() {
  d3.json("/data?filter="+JSON.stringify(queryFilter), function (d){
    chartData = d;
    console.log(chartData);

    process_schema();
    create_buttons();
    create_modals();

    initialize_charts();

    load_from_state();
    initialize_thumbnails();
    dc.renderAll(); 
    

    console.log(charts);
    console.log(dimensions);
    console.log(groups)
  })
}
function load_from_state(){
  for(var i in filtering_attributes){
    var pre_filter = filtering_attributes[i]["filter"]
    console.log(pre_filter)
    console.log(i)
    if(pre_filter)
    { 
      charts[i].filter(pre_filter);
      console.log("Pre filtering")
    }
  }
}

var filtering_attributes = [];
var visual_attributes = [];
var attributes = [];
var schema_data = {};
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
    								<div class="panel-body">\
    									<div id="dc-'+attribute_name+'-thumb" class="thumb-chart" data-toggle="modal" data-target="#'+attribute_name+'Modal"></div>\
    								</div>\
    							</div>\
    						</div>'
   	var accordian_full = accordian_panel_header + accordian_panel_body
    //var button = "<button id='button' class='btn btn-default' type='button' data-toggle='modal' data-target='#"+attribute_name+"Modal'>"+ attribute_name + "</button>";
    filtering_attributes_div.append(accordian_full);
  }
}
function create_modals() {
  var visualization_modals = $("#visualization_modals");
  for(var i=0; i<filtering_attributes.length; i++){

    var attribute_name = filtering_attributes[i]["name"];
    var chart_modal = "<div class='modal fade' id='"+attribute_name+"Modal' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>"
            + "<div class='modal-dialog modal-lg'>"
              + "<div class='modal-content'>"
                +"<h3>"+attribute_name+"</h3>"
                + "<div id='dc-"+attribute_name+"-chart' class='chart'></div>"
              + "</div>"
            + "</div>"
            + "</div>"  
    visualization_modals.append(chart_modal)
  }
}

function process_schema(){  
  for(var index in schema_data){
    var attribute = schema_data[index];
    attributes.push(attribute);
    if(attribute["visual-attribute"])
      visual_attributes.push(attribute);
    if(attribute["filtering-attribute"]){
      filtering_attributes[attribute["filtering-attribute-order"] -1] = attribute; // -1 for zero based indexing
    }
  }
  console.log(filtering_attributes);
  console.log(visual_attributes);
}


dimensions = {}
groups = {}
charts = []
thumb_charts = []
function initialize_charts(){

  for(var i in filtering_attributes){
    var attribute_name = filtering_attributes[i]["name"];

    dimensions[attribute_name] = function(dim){
      var dim = attribute_name
      return {
        filter: function(f) {
        if(f) {
                console.log("say wahaat?")
                queryFilter[dim] = f;
                refresh()
          } else {
                 console.log("say wahaat?")
                delete queryFilter[dim];
                refresh()
          }
        },
        top: function(){
          console.log("top")
          return chartData[dim].top
        }, 
        filterAll: function(){

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
    }()  
  }

  for(var i in filtering_attributes){
    var attribute_name = filtering_attributes[i]["name"];
    var domain = [0,100];
    var visualization_type = filtering_attributes[i]["visualization-type"];


    if(filtering_attributes[i]["domain"]){
      domain = filtering_attributes[i]["domain"]
    }
    if(visualization_type == "barChart"){
      charts[i] = function(aname,pre_filter) {
        aname = attribute_name;
        pf = pre_filter
        //attri = attr[index]
        
        //console.log("#dc-"+aname+"-chart");
        var c =  dc.barChart("#dc-"+aname+"-chart");
        c.width(300)
        .height(250).dimension(dimensions[aname])
        .group(groups[aname])
        .x(d3.scale.linear().domain(domain))

        return c;
        }();
    } else {
      charts[i] = function(aname) {
        aname = attribute_name;
        //attri = attr[index]
        
        console.log("#dc-"+aname+"-chart");
        var c =  dc.pieChart("#dc-"+aname+"-chart");
        c.width(300)
        .height(250).dimension(dimensions[aname])
        .group(groups[aname])
        
        return c;
        }();      
    }
  } 
}

function initialize_thumbnails(){
  for(var i in filtering_attributes){
    var attribute_name = filtering_attributes[i]["name"];
    var domain = [0,100];
    var visualization_type = filtering_attributes[i]["visualization-type"];


    if(filtering_attributes[i]["domain"]){
      domain = filtering_attributes[i]["domain"]
    }
    if(visualization_type == "barChart"){
      charts[i] = function(aname,pre_filter) {
        aname = attribute_name;
        pf = pre_filter
        //attri = attr[index]
        
        //console.log("#dc-"+aname+"-chart");
        var c =  dc.barChart("#dc-"+aname+"-thumb");
        c.width(180)
        .height(120).dimension(dimensions[aname])
        .group(groups[aname])
        .x(d3.scale.linear().domain(domain))
        .elasticY(true)
        .turnOffControls()
        .renderLabel(false)
        .brushOn(false)
        .xAxis().tickFormat(function(v) { return ""; })

        return c;
        }();
    } else {
      charts[i] = function(aname) {
        aname = attribute_name;
        //attri = attr[index]
        
        console.log("#dc-"+aname+"-chart");
        var c =  dc.pieChart("#dc-"+aname+"-thumb");
        c.width(80)
        .height(80).dimension(dimensions[aname])
        .group(groups[aname])
        .turnOffControls()
        .radius(30)
        .filter(function(){})
        .renderLabel(false)
        
        return c;
        }();      
    }
  } 
}

d3.json("visual-schema.json", function(err, data){
  schema_data = data;
  refresh_init();
  
});


