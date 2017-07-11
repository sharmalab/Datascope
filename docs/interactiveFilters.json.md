###interactiveFilters.json###
**For a complete overview please look at the [Schema Reference](http://lastlegion.bitbucket.org/interactiveFiltersSchema.html)
**

This file describes how the dashboard should look like. 
```
#!javascript

[
    {
        "name": "id",
        "datatype": "integer",
        "visual-attribute": true
    },
    {
        "name": "guid",
        "datatype": "string",
        "visual-attribute": true
    },
    {
        "name": "name",
        "datatype": "string",
        "visual-attribute": true
    },
    {
        "name": "registered",
        "datatype": "string",
        "visual-attribute": true
    },
    {
        "name": "gender",
        "datatype": "string",
        "filtering-attribute": true,
        "filtering-attribute-order": 4,
        "visualization-type": "pieChart",
        "filter": "male"
    },
    {
        "name": "age",
        "datatype": "integer",
        "filtering-attribute": true,
        "visual-attribute": true,
        "filtering-attribute-order": 1,
        "visualization-type": "barChart",
        "domain": [
            20,
            40
        ],
        "filter": [
            23,
            30
        ]
    },
    {
        "name": "isActive",
        "datatype": "boolean",
        "filtering-attribute": true,
        "visual-attribute": true,
        "filtering-attribute-order": 3,
        "visualization-type": "pieChart"
    }
]

```

* **name**(String): The name of the attribute with which it is refered to. It should be the same as provided in the backend schema.
* **datatype**(String): The type of data. This information is unused as of now.
* **filtering-attribute**(Boolean): If true it is considered as a filtering attribute and is expected to have a ```filtering-attribute-order```, ```visualization-type```
* **visual-attribute**(Boolean): If the attribute is used just as for rendering visualizations based on the filters of the filtering attributes. Example could be an attribute that is shown on the data-table but cannot be filtered.
* **filtering-attribute-order**(Integer): 
* **visualization-type**(String): The type of visualization to be done. Currently supports: "barChart" and "pieChart".
* **domain**(Array of 2 integers): Required if the visualization type is barChart. Gives information about the extent of the data.
* **filter**: If this entry is provided the corresponding filter is applied to the attribute.

### TODOs ###
* **Label** We should have a another field called "label" in the schema. The label would provide a ```label-name``` to display an attribute instead of the ```name```.