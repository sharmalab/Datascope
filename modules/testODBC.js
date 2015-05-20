var db = require("odbc")()
    var cn = "dsn=mysql;server=localhost;user=root;database=test;port=3306;password=123456;command timeout=30000;";

    ;

db.open(cn, function (err) {
    if (err) {
        return console.log(err);
    }

    //we now have an open connection to the database
});