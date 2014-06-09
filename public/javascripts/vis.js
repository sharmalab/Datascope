function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 

var attributes = [];
var filtering_attributes = [];
var visual_attributes = [];
var key_attributes = [];
var data_providers = [];
var key_dimensions = [];
var dimensions = [];
var groups = [];
var charts = [];


var data;
var ndx;

function merge_data(){
	return;
}

function create_buttons(filtering_attribute){
	var filtering_attributes_container = $("#filtering_attributes");
	var attribute_name = filtering_attribute["name"]
	filtering_attributes_container.append("<button type='button' class='btn btn-default btn-lg' data-toggle='modal' data-target='#"+attribute_name+"Modal'>"+attribute_name+"</button>");

}
function create_charts(filtering_attribute,index){
	var filtering_charts_container = $("#filtering_charts");
	var attribute_name = filtering_attribute["name"];

	var chart_modal = "<div class='modal fade' id='"+attribute_name+"Modal' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>"
						+ "<div class='modal-dialog modal-lg'>"
							+ "<div class='modal-content'>"
								+ "<div id='dc-"+attribute_name+"-chart'></div>"
							+ "</div>"
						+ "</div>"
						+ "</div>"	
	
	filtering_charts_container.append(chart_modal);
	


	var chart_type = filtering_attribute["chart-type"]

	var chart;

	if(chart_type == "pieChart"){
		chart = dc.pieChart("#dc-"+attribute_name+"-chart");
		chart.dimension(dimensions[index])
			.group(groups[index])
			.width(300)
			.height(300)
			.radius(80)
			.label(function(p){
				return p.data.key + " ";
			})
			.innerRadius(40)
			.transitionDuration(300)
			.renderLabel(true);		
	}
	else
	{
		//Obtain max, min from the schema?
		var min = d3.min(data, function(d){return +d[attribute_name]});
		var max = d3.max(data, function(d){return +d[attribute_name]});


		chart = dc.barChart("#dc-"+attribute_name+"-chart")
		chart.dimension(dimensions[index])
			.group(groups[index])
			.width(400)
			.height(240)
			.x(d3.scale.linear().domain([min,max]))
			.elasticY(true);		
	}
	//print_filter(dimensions[index].filter())
	charts.push(chart)


}
function create_table(){
	var table_columns = [];
	var table_header = "";
	for(var attr in visual_attributes){
		var col_header = visual_attributes[attr]["name"];

		table_header+= "<th>"
		table_header+= col_header
		table_header+= "</th>"
		//nsole.log(visual_attributes[attr]["name"])
		function colFunction(col_header){
			return function(d){return d[col_header]}
		}
		table_columns.push(colFunction(col_header))
	}


	$("#dc-data-table-header").append(table_header);

	var datatable=dc.dataTable("#dc-data-table");


	datatable.dimension(key_dimensions[0])
		.group(function(d){
			var attribute = key_attributes[0]["name"];
			return Math.floor(d[attribute]/100)*100;
		})
		.columns(table_columns);


}

function process_data(){

	//Apply crossfilter to the data
	ndx = crossfilter(data);


	var index = 0;
	//Process filtering attributes
	for(var attr in filtering_attributes) {
		//Create dimensions
		dimension = ndx.dimension(function(d) {
			var dim_attribute = filtering_attributes[attr]["name"]
			return d[dim_attribute];
		});
		dimensions.push(dimension);
		//Create groups
		groups.push(dimension.group())

		//Create html divs for displaying the visualization
		create_buttons(filtering_attributes[attr])
		create_charts(filtering_attributes[attr], index)
		index++;
	}
	for(var attr in key_attributes){
		dimension = ndx.dimension(function(d) {
			var dim_attribute = key_attributes[attr]["name"]
			return d[dim_attribute]
		})
		key_dimensions.push(dimension)
	}
	create_table();

	dc.renderAll();
}

function load_data(data_providers){

	for(var i in data_providers){
		var data_provider = data_providers[i];
		d3.json(data_provider, function(err,d){
			if(err){
				console.log("Error");
			}
			data = d;

			//Merge data
			merge_data();

			process_data();
		})
	}

}


d3.json("../data-schema.json", function(err,data){
	if(err){
		console.log(err);
	}
	console.log(data);	
	for(var object in data){
		//console.log(data[i]);
		var attribute = data[object];
		attributes.push(attribute);
		//console.log(attribute["visual-attribute"])
		if(attribute["visual-attribute"]){
			visual_attributes.push(attribute);
		}
		if(attribute["filtering-attribute"]){
			filtering_attributes.push(attribute);
		}
		if(attribute["key-attribute"]){
			key_attributes.push(attribute);
		}

		//Check if from a newer data source
		var data_provider_exists = false;
		for(var i in data_providers){
			if(data_providers[i] == attribute["data-provider"]){
				data_provider_exists = true;
			}
		}
		if(data_provider_exists == false){
			data_providers.push(attribute["data-provider"])
		}

		i++;

	}
	//Read data from various data providers
	load_data(data_providers)
})	
