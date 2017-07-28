/* global globalDataSourceName */
/* global $ */
var React = require("react");
var TableCounts = 0;
//var Decoder = require("../../stores/Decoder.js");
var AppStore = require("../../stores/AppStore.jsx");
var DataTable = React.createClass({

    getInitialState: function(){
        return {"id": Math.floor(Math.random(2)*100)};
    },
    decode: function(d) {
      //If data dictionary is provided then decode the tabel
      var decoder = AppStore.decoder.decoder;
      var self = this;
      var tableAttributes = self.props.config.attributes;
     
      for(var i=0; i<d.length; i++){
        var row = d[i];
        for(var j=0; j<row.length; j++){
          if(tableAttributes[j]){
            var attributeName = tableAttributes[j].attributeName;
            if(decoder[attributeName]){
              if(decoder[attributeName][row[j]]){
                row[j] = decoder[attributeName][row[j]];
              }
            }
          }
        }

      }
      return d;
    },
    componentDidMount: function(){
        var self = this;
        var columns = [];
        var count=0;
        var url;
    
        var id = this.state.id;
        var tableId = "vis"+ id;
        TableCounts++;
        var tableAttributes = self.props.config.attributes;
   
        for(var i in tableAttributes){
            if(!tableAttributes.hasOwnProperty(i)){
              continue;
            }
            columns[count] = {};
            //columns[count]["data"] = self.props.config.attributes[i].name;
            columns[count].title = self.props.config.attributes[i].label || self.props.config.attributes[i].attributeName;
            columns[count].bSearchable = true;
            columns[count].bSortable = true;
            columns[count].name = self.props.config.attributes[i].attributeName;
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
            "ajax": {
              "url": ajaxUrl,
              "dataSrc": function(d){
                var data = self.decode(d.data);
                return data;
              }
            },
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

        url = self.props.config.url;

        $("#"+tableId+" tbody").on("click", "tr", function(){
            //var url = self.props.config.url
            //var id = DataTable.fnGetData(this)[0];
            //console.log(dataTable.row(this).data());
            var data = dataTable.row(this).data();
            url = data[data.length-1];
            //window.open(url);
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
        //var tableAttribtes = [];
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
