var queryFilter = {};
var data = {};

function refresh(){
	d3.json("/data?filter="+JSON.stringify(queryFilter), function(d){	
		data = d;
		Object.keys(data).forEach(function(dim){
			if(typeof data[dim].values[0].key === 'string'){
				data[dim].values.forEach(function(d,i){
					data[dim].values[i].key = new Date(d.key)
				});
			}
		})
		console.log(data);
		dc.renderAll();
	});
}

var datatable = dc.dataTable("#dc-data-table");

var charts = [
	datatable.dimension(ageDim)
		.group(function(d){
			return d.age;
		})
		.columns([
			function (d) {return d.Age},
			function (d) {return d.id},
			function (d) {return d.gender},
			function (d) {return d.isActive},
			function (d) {return d.Ai},
			function (d) {return d.Bi},
			function (d) {return d.Ci},
			function (d) {return d.Di},
			function (d) {return d.Eb},
			function (d) {return d.Ff},
			function (d) {return d.Gf}
		])
	
]

refresh();