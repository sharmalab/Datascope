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
	filtering_attributes_container.append("<button type='button' class='btn-lg btn-default' data-toggle='modal' data-target='#"+attribute_name+"Modal'>"+attribute_name+"</button>");
	console.log("appending")
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


	/*
	var chart_modal = $("<div class='modal fade' id='"+attribute_name+"Modal' role='dialog' aria-labelledby='myLargeModalLabel' aria-hidden='true'>")
	chart_modal=chart_modal.append($("<div class='modal-dialog modal-lg'>"))
	chart_modal = chart_modal.append($("<div class='modal-content'>"))
							.append($("<div id='dc-"+attribute_name+"-chart'>"))
	filtering_charts_container.append(chart_modal);
	*/
	/*
	filtering_charts_container.append(chart_modal)
				.append("<div class='modal-dialog modal-lg'>")
		.append("<div class='modal-content'>")
		.append("<div id='dc-"+attribute_name+"-chart></div>")
		.append("</div>")	//class=modal
		.append("</div>")	//class=modal-dialog
		.append("</div>")	//id=attribute_nameModal
	*/
}
function create_table(){
	var table_columns = [];
	var table_header = "";
	for(var attr in visual_attributes){
		var col_header = visual_attributes[attr]["name"];
		console.log(col_header)
		table_header+= "<th>"
		table_header+= col_header
		table_header+= "</th>"
		//nsole.log(visual_attributes[attr]["name"])
		function colFunction(col_header){
			return function(d){return d[col_header]}
		}
		table_columns.push(colFunction(col_header))
	}
	console.log(table_columns)

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

	console.log(data);
	
	//Apply crossfilter to the data
	ndx = crossfilter(data);
	console.log(ndx);

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

	console.log(dimensions);
	console.log("Charts")
	console.log(charts)
	console.log("done");
	dc.renderAll();
}

function load_data(data_providers){
	console.log("Load data")
	for(var i in data_providers){
		var data_provider = data_providers[i];
		d3.json(data_provider, function(err,d){
			console.log("Loading "+data_provider);
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
	console.log("Attributes");
	console.log(attributes);
	console.log("Visual attributes");
	console.log(visual_attributes);
	console.log("Filtering attributes");
	console.log(filtering_attributes);
	//Read data from various data providers
	load_data(data_providers)
})	

	/*
	d3.json("../small-data.json", function(err,data){
		if(err){
			console.log("Error!")
			console.log(err);
		}
		//console.log(data);

		//Initialize charting objects
		var datatable=dc.dataTable("#dc-data-table");
		var ageChart=dc.barChart("#dc-age-chart");
		var genderChart = dc.pieChart("#dc-gender-chart");
		var isActiveChart = dc.pieChart("#dc-isActive-chart");
		var aChart = dc.barChart("#dc-a-chart");
		var bChart = dc.barChart("#dc-b-chart");
		var cChart = dc.barChart("#dc-c-chart");
		var dChart = dc.pieChart("#dc-d-chart");
		var eChart = dc.pieChart("#dc-e-chart");
		var fChart = dc.barChart("#dc-f-chart");
		var gChart = dc.barChart("#dc-g-chart");
		//fChart = {}
		//Apply crossfilter to the data
		ndx = crossfilter(data);

		//Create crossfilter dimensions
		var idDim = ndx.dimension(function (d) {return d.id});
		var ageDim = ndx.dimension(function (d) {return d.age });
		var genderDim = ndx.dimension(function (d){return d.gender});
		var isActiveDim = ndx.dimension(function (d){return d.isActive});
		var ADim = ndx.dimension(function (d) {return d.Ai});
		var BDim = ndx.dimension(function (d) {return d.Bi});
		var CDim = ndx.dimension(function (d) {return d.Ci});
		var DDim = ndx.dimension(function (d) {return d.Di});
		var EDim = ndx.dimension(function (d) {return d.Eb});
		var FDim = ndx.dimension(function (d) {return d.Ff});
		var GDim = ndx.dimension(function (d) {return d.Gf});

		var AGroup = ADim.group().reduceCount(function (d) {return d.Ai});
		var idGroup = idDim.group();
		var ageGroup = ageDim.group();
		var genderGroup = genderDim.group();
		var isActiveGroup = isActiveDim.group();
		var BGroup = BDim.group().reduceCount(function (d) {return d.Bi});
		var CGroup = CDim.group().reduceCount(function (d) {return d.Ci});
		var DGroup = DDim.group().reduceCount(function (d) {return d.Di});
		var EGroup = EDim.group()//.reduceSum(function (d) {return d.Eb});
		var nFBins = 88;
		var FxExtent = d3.extent(data, function (d) {return d.Ff});
		var FBinWidth = (FxExtent[1] - FxExtent[0])/nFBins;
		var FGroup = FDim.group(function(d){return Math.floor(d/FBinWidth)*FBinWidth});

		var nGBins = 10;
		var GxExtent = d3.extent(data, function (d) {return d.Gf});
		var GBinWidth = (GxExtent[1]-GxExtent[0])/nGBins;
		var GGroup = GDim.group(function(d){return Math.floor(d/GBinWidth)*GBinWidth});
		//console.log(AGroup)
		//console.log(ageDim)
		//print_filter(EDim.filter())

		//Draw the charts
		ageChart.dimension(ageDim)
			.width(400)
			.height(240)
			.group(ageGroup)
			.x(d3.scale.linear().domain([20,40]))
			.elasticY(true);

		genderChart.dimension(genderDim)
			.group(genderGroup)
			.width(300)
			.height(300)
			.radius(80)
			.label(function(p){
				return p.data.key + " ";
				console.log(p.key)
			})
			.innerRadius(40)
			.transitionDuration(300)
			.renderLabel(true);



		isActiveChart.dimension(isActiveDim)
			.group(isActiveGroup)
			.width(300)
			.height(300)
			.radius(80)
			.label(function(p){
				return p.data.key + " ";
				console.log(p.key)
			})
			.innerRadius(40)
			.transitionDuration(300)
			.renderLabel(true);


		aChart.dimension(ADim)
			.width(400)
			.height(240)
			.group(AGroup)
			.x(d3.scale.linear().domain([0,10]))
			.elasticY(true);

		bChart.dimension(BDim)
			.width(400)
			.height(240)
			.group(BGroup)
			.x(d3.scale.linear().domain([0,8]))
			.elasticY(true);
		cChart.dimension(CDim)
			.width(400)
			.height(240)
			.group(CGroup)
			.x(d3.scale.linear().domain([0,8]))
			.elasticY(true);
		dChart.dimension(DDim)
			.group(DGroup)
			.width(300)
			.height(300)
			.radius(80)
			.label(function(p){
				return p.data.key + " ";
				console.log(p.key)
			})
			.innerRadius(40)
			.transitionDuration(300)
			.renderLabel(true)


		eChart.dimension(EDim)
			.group(EGroup)
			.width(300)
			.height(300)
			.radius(80)
			.label(function(p){
				return p.data.key + " ";
				console.log(p.key)
			})
			.innerRadius(40)
			.transitionDuration(300)
			.renderLabel(true)

		fChart.width(600)
			.height(300)
			.dimension(FDim)
			.group(FGroup)
			.x(d3.scale.linear().domain(FxExtent).range([12,100]))
			.elasticY(true)
			.xAxis()

		gChart.width(600)
			.height(300)
			.dimension(GDim)
			.group(GGroup)
			.x(d3.scale.linear().domain(GxExtent).range([0,1]))
			.elasticY(true)
			.xAxis()
		//	.xUnits(function(){return 1})
	//		.xUnits(function (){return});


		datatable.dimension(ageDim)
			.group(function(d){
				return d.age;
			})
			.columns([
				function (d) {return d.Age},
				function (d) {return d.id},
				function (d) {return d.gender},
				function (d) {return d.isActive}
			]);

		$("#dc-age-chart").hide();	
		$("#ageModal").on('show.bs.modal', function (e){
			$("#dc-age-chart").show();
		});
		$("#dc-gender-chart").hide();
		$("#genderModal").on('show.bs.modal', function(e){
			$("#dc-gender-chart").show();
		});
		$("#dc-isActive-chart").hide();
		$("#isActiveModal").on('show.bs.modal', function(e){
			$("#dc-isActive-chart").show();
		})
		$("#dc-a-chart").hide();
		$("#aModal").on('show.bs.modal', function (e) {
			$("#dc-a-chart").show();
		})
		$("#dc-b-chart").hide();
		$("#bModal").on('show.bs.modal', function (e) {
			$("#dc-b-chart").show();
		})
		$("#dc-c-chart").hide();
		$("#cModal").on('show.bs.modal', function (e) {
			$("#dc-c-chart").show();
		})
		$("#dc-d-chart").hide();
		$("#dModal").on('show.bs.modal', function (e) {
			$("#dc-d-chart").show();
		})
		$("#dc-e-chart").hide();
		$("#eModal").on('show.bs.modal', function (e){
			$("#dc-e-chart").show()
		})
		$("#dc-f-chart").hide();
		$("#fModal").on('show.bs.modal', function (e){
			$("#dc-f-chart").show()
		})
		$("#dc-g-chart").hide();
		$("#gModal").on('show.bs.modal', function (e){
			$("#dc-g-chart").show()
		})
		dc.renderAll();
	});
	*/	
