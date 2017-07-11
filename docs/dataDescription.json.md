###dataDescription###

**For a complete overview please look at the [Data Description Schema Reference](http://lastlegion.bitbucket.org/dataDescriptionSchema.html)
**

The dataDescription.json file is the specification that the data provider provides, which provides the system, the information pertaining to the number of attributes, the type of each attribute, whether or not filtering would be performed on the attribute etc.

The following is an example of a dataDescription.json file:

```
#!json
[
    {
        "name": "id",
        "datatype": "integer",
        "dataProvider": "source1",
        "attributeType": ["visual", "key"]
    },
    {
        "name": "age",
        "datatype": "integer",
        "dataProvider": "source1",
        "attributeType": ["visual", "filtering"]
    },
    {
        "name": "isActive",
        "datatype": "boolean",
        "dataProvider": "source1",
        "attributeType": ["visual", "filtering"]
    },
    {
        "name": "Ai",
        "datatype": "integer",
        "dataProvider": "source1",
        "attributeType": ["filtering"]
    },
    {
        "name": "Bi",
        "datatype": "integer",
        "dataProvider": "source1",
        "attributeType": ["visual", "filtering"]
    }
]
```