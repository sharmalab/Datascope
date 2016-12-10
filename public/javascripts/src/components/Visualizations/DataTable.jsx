var React = require("react");
var TableCounts = 0;
var DataTable = React.createClass({

    getInitialState: function(){
        return {"id": Math.floor(Math.random(2)*100)};
    },
    componentDidMount: function(){
        var self = this;
        var columns = [];
        var count=0;
        var url;

        var id = this.state.id;
        var tableId = "vis"+ id;
        TableCounts++;
        for(var i in self.props.config.attributes){
            columns[count] = {};
            //columns[count]["data"] = self.props.config.attributes[i].name;
            columns[count]["title"] = self.props.config.attributes[i].label || self.props.config.attributes[i].attributeName;
            columns[count]["bSearchable"] = true;
            columns[count]["bSortable"] = true;
            columns[count]["name"] = self.props.config.attributes[i].attributeName;
            if(self.props.config.attributes[i].type){
                url = self.props.config.attributes[i];
            }
            count++;
        }
        //console.log(columns);
        var ajaxUrl = "dataTable/next?dataSourceName=" + globalDataSourceName ;
        //console.log(ajaxUrl);
        var dataTable = $('#'+tableId).DataTable({
            //bSort: false,
            //bFilter: false,
            aoColumns: columns,
            "ajax": ajaxUrl,
            //"processing": true,
            "serverSide": true,
            //"scrollY": true,
            //"scrollX": true,
            //"width": "100%",
            "bScrollAutoCss": true,
            

           
            //"scrollX": "100%",
            "pageLength": 10,
            columns: columns,
            "responsive": true,
            "bAutoWidth": true
            //fixedHeader: true,
            //responsive: true,
        });

        var url = self.props.config.url;

        $("#"+tableId+" tbody").on("click", "tr", function(){
            //var url = self.props.config.url
            //var id = DataTable.fnGetData(this)[0];
            //console.log(dataTable.row(this).data());
            var data = dataTable.row(this).data();
            var url = data[data.length-1];
            window.open(url);
        });

        $("#"+tableId).removeClass("display").addClass("table table-striped table-bordered");

        self.setState({"dataTable": dataTable});
    },
    componentWillReceiveProps: function(){
        var dataTable = this.state.dataTable;
        //console.log(dataTable);
        if(dataTable){
          //console.log(dataTable);
          if(dataTable.ajax){
              dataTable.ajax.reload(); //jquery datatable fix
          }
        }
    },
    render: function(){
        var tableAttribtes = [];

        //console.log(this.state.id);
        var id = this.state.id;
        var tableId = "vis"+ id;
            return(
                <table id={tableId} className="display datatablevis">
                    
                </table>
            );
    }
});

module.exports = DataTable;
