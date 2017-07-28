### dataSource.json ###

Describes the data sources. Users need to plugin information about their data repositories. The system would use the information to access the data and use it for creating the dashboards.


Consider the following example in which we're fetching data from 2 sources ```s1``` and ```s2```.
```
#!json
{
    "dataSourceAlias": "sourceJoin",
    "joinKey": ["A"],
    "dataSources": [
        {
            "sourceName": "s1",
            "sourceType": "csv",
            "options":{
                "path": "examples/newDataSourceConfig/data/data1.csv"
            },
            "dataAttributes": ["A", "B", "C"]

        },
        {
            "sourceName": "s2",
            "sourceType": "csv",
            "options":{
                "path": "examples/newDataSourceConfig/data/data2.csv"
            },
            "dataAttributes": ["A", "D"]
        }
    ]
}

```
* **dataSourceAlias**: Name of the data source. Used by ```data-description.json``` to identify data sources.
* **joinKey**: Attribute used for joining the data sources. Must be present in all the sources.
* **sourceName**: Used to identify the data source.
* **sourceType**: The type of data source. The system currently supports: ```json, csv, rest/json, rest/csv, odbc```.
* **options**: An object used to specify the path of the data source.
* **dataAttributes**: The attributes provided by this data source. Accepts an array of strings.
