var React = require("react");
var DataTable = React.createClass({
    componentDidMount: function(){


        var self = this;



            var columns = [];
            var count=0;
            for(var i in self.props.config.attributes){
                columns[count] = {};
                //columns[count]["data"] = self.props.config.attributes[i].name;
                columns[count]["title"] = self.props.config.attributes[i].label || self.props.config.attributes[i].attributeName;
                columns[count]["bSearchable"]= false;
                columns[count]["bSortable"] =false ;
                count++;
            }
            dataTable = $('#vis').DataTable({
                bSort: false,
                bFilter: false,
                aoColumns: columns,
                "ajax": "dataTable/next",
                "processing": true,
                "serverSide": true,
                "scrollY": 420,
                "scrollX": true,
                 "pageLength": 100,
                columns: columns

            });
            $("#vis tbody").on("click", "tr", function(){
                var url = self.props.config.url || "http://imaging.cci.emory.edu/phone/";
                window.open(url); 
            });

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
