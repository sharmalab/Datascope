### dataSource.json ###
**For a complete overview please look at the [Schema Reference](http://lastlegion.bitbucket.org/dataSourceSchema.html)
**

Describes the data sources. Users need to plugin information about their data repositories. The system would use the information to access the data and use it for creating the dashboards.

Accepts an array of objects that describe the data repositories. An example is shown below

```
#!javascript
[
	{
		"name": "source1",
		"type": "json",
		"options":{
			"path": "data/small-data.json"
		},
		"attributes": ["id", "guid", "name", "age", "Ai", "Bi", "Ci", "Di", "Eb", "Ff", "Gf", "Hf"]
	}
]
```
* **name**: Name of the data source. Used by ```data-description.json``` to identify data sources.
* **type**: The type of data source. The system currently supports: ```json, csv, rest/json, rest/csv```. The system can be extended to support more types.
* **options**: An object used to specify the path of the data source. 
* **attributes**: The subset of attributes provided by this data source. Accepts an array of strings.