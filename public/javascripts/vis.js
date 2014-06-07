function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 



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