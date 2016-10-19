var React = require("react");
var DataTable = React.createClass({
    componentDidMount: function(){
        var self = this;
        var columns = [];
        var count=0;
        var url;

        for(var i in self.props.config.attributes){
            columns[count] = {};
            //columns[count]["data"] = self.props.config.attributes[i].name;
            columns[count]["title"] = self.props.config.attributes[i].label || self.props.config.attributes[i].attributeName;
            columns[count]["bSearchable"] = true;
            columns[count]["bSortable"] = true;
            if(self.props.config.attributes[i].type){
                url = self.props.config.attributes[i];
            }
            count++;
        }

        var ajaxUrl = "dataTable/next?dataSourceName=" + globalDataSourceName;

        dataTable = $('#vis').DataTable({
            //bSort: false,
            //bFilter: false,
            aoColumns: columns,
            "ajax": ajaxUrl,
            "processing": true,
            "serverSide": true,
            //"scrollY": true,
            //"scrollX": true,
            "width": "1000px",
            //"scrollX": "100%",
            "pageLength": 10,
            columns: columns,
            //fixedHeader: true,
            responsive: true,
        });

        var url = self.props.config.url;

        $("#vis tbody").on("click", "tr", function(){
            //var url = self.props.config.url
            //var id = DataTable.fnGetData(this)[0];
            console.log(dataTable.row(this).data());
            var data = dataTable.row(this).data();
            var url = data[data.length-1];
            window.open(url);
        });

        $("#vis").removeClass("display").addClass("table table-striped table-bordered");
    },
    componentWillReceiveProps: function(){
        if(dataTable.ajax){
            dataTable.ajax.reload(); //jquery datatable fix
        }
    },
    render: function(){
        var tableAttribtes = [];


            return(
                <table id="vis" className="display">
                    
                </table>
            );
    }
});

module.exports = DataTable;
