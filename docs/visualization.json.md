# Visualization.json

Accepts an array of objects, each object describing the visualization. Example:
```
#!json
[

    {
        "visualizationType": "dataTable",
        "attributes":[

        {"attributeName": "CancerType"},
        {"attributeName": "BCRPatientUIDFromClinical"},
        {"attributeName": "BCRSlideUID"},
        {"attributeName": "BCRPatientUIDFromPathology"}
        ],
        "heading": "TCGA",
        "subheading": ""
    },

    {
        "visualizationType": "imageGrid",
        "attributes":[
            {
                "attributeName": "image",
                "type": "image"
            }
        ],
        "heading": "Bubble Chart",
        "subheading": "Using synthetic data"
    },
    {

        "visualizationType": "heatMap",
        "attributes":[

            {
                "attributeName": "AgeatInitialDiagnosis",
                "type": "x"
            },
            {
                "attributeName": "KarnofskyScore",
                "type": "y"
            }
        ],
        "heading": "Heat Map",
        "subheading": "AgeatInitialDiagnosis vs KarnofskyScore"
    }

]
```
In the above example we have 3 visualizations ```dataTable```, ```imageGrid``` and ```heatMap```. Details of the supported visualizations are described below.


The system currently supports 6 types of visualizations:

1. dataTable
2. bubbleChart
3. imageGrid
4. heatMap
5. geoCloroplethMap
6. markerMap
7. twoDimStat

### 1. dataTable ###
Provides a tabular representation of the provided attributes. Shows 100 records at a time.

```
#!json
{
    "visualizationType": "dataTable",
    "attributes":[
    	{"attributeName": "id"},
    	{"attributeName": "Ai"},
    	{"attributeName": "Di"}
    ]
}
```


### 2. bubbleChart ###
A bubble chart representation of the provided attributes. Can be used to visualize 4 dimensions.

```
#!json

{
    "visualizationType": "bubbleChart",
    "attributes":[
        {
            "attributeName": "a1",
            "type": "x",
            "dimension": true
        },
        {
            "attributeName": "a2",
            "type": "y"
        },
        {
            "attributeName": "a3",
            "type": "color"
        },
        {
            "attributeName": "a4",
            "type": "r"
        },
    ]
}



```

Following types are used to represent 4 dimensions on the chart.

* **x** : on the x axis
* **y** : on the y axis
* **r** : radius of bubbles
* **color**: colors of bubbles

Atleast one attributes needs to have **dimension**: true.


### 3. imageGrid ###
Creates an image grid using the images from the attribute having ```type: image```

```
#!json

{
    "visualizationType": "imageGrid",
    "attributes":[
        {
            "attributeName": "image",
            "type": "image"
        }
    ],
    "heading": "Image grid",
    "subheading": "Using dummy data"
}
```

Requires an attribute to have ```"type": "image"``` which shall be used as the location of the image.


### 4. heatMap ###
```
#!json
    {

        "visualizationType": "heatMap",
        "attributes":[

            {
                "attributeName": "AgeatInitialDiagnosis",
                "type": "x"
            },
            {
                "attributeName": "KarnofskyScore",
                "type": "y"
            }
        ],
        "heading": "Heat Map",
        "subheading": "AgeatInitialDiagnosis vs KarnofskyScore"
    }
```

Requires attributes having ```"type": "x"``` and ```"type": "y"``` for the x and y axes respectively.


### 5. geoChoroplethMap ###
Creates a cloropleth map by rendering a geo location file.

```
#!json
    {
      "visualizationType": "geoChoroplethMap",
      "attribute": {
        "name": "ProviderState",
        "type": "ABBR"
      },
      "geoJson": {
        "path": "data/geoJsonUSStates.json"
      },
      "heading": "Geo Choropleth Map",
      "subheading": "Medicare data"
    }
```

* ```visualizationType``` needs to be ```geoCloroplethMap```
* ```attribute``` contains information about the attribute that is going to to be used for drawing the map
    * ```name``` is the name of the attribute in the dataset
    * ```type``` is the type of the attribute. Currently it supports two different types: ```NAME``` and ```ABBR```.
    They basically represent the name of the attribute in the geo location file. For example if the dataset contains
    the entire names of the states, ```type``` will be ```NAME```, if the dataset contains the abbreviations of the
    states' names, ```type``` will be ```ABBR```
* ```geoJson``` contains information about the geo location file that will be rendered
    * ```path``` is the location of the geo location file. Currently Datascope can render only the states of the US
    and the file is ```data/geoJsonUSStates.json```
* ```heading``` is the title that the visualization will have
* ```subheading``` is a subtitle that the visualization will have

Datascope is summing up the occurrences within a dataset for each state, the color gradient of a state
meaning the number of the entries in the dataset from that state.

### 6. markerMap ###
Creates a leaflet map containing markers that are specified in the dataset.

```
#!json
    {
        "visualizationType": "markerMap",
        "attributeName": "geo",
        "heading": "Marker Map",
        "subheading": "Renewable Energy Plants in Bulgaria on 2012"
    }
```

* ```visualizationType``` needs to be ```markerMap```
* ```attributeName``` is the name of the attribute in the dataset containing the markers. It can be set as either
    'lat,lng' string or as an array [lat,lng]
* ```heading``` is the title that the visualization will have
* ```subheading``` is a subtitle that the visualization will have

### 7. twoDimStat ###
Creates a two dimensional statistics visualization. It shows a table containing the statistics performed on two
attributes specified by the user in the configuration file.

```
#!json
    {
        "visualizationType": "twoDimStat",
        "attributes": {
          "attr1": "Age",
          "attr2": "Survived"
        },
        "statistics": [
          "correlation", "custom-twoDimMean", "dotProduct"
        ],
        "heading": "Two Dimensional Statistics: Age vs Survived"
  }
```

* ```visualizationType``` needs to be ```twoDimStat```
* ```attributes``` contains the two attributes that are going to be used in computing the two dimensional statistics
    * ```attr1``` represents the first attribute
    * ```attr2``` represents the second attribute
* ```statistics``` contains the statistics to be computed for the desired attributes. By being left as ```default```,
    all the possible statistics will be automatically computed (```correlation```, ```rankCorrelation```,
    ```dotProduct```, ```euclidianDistance```, ```covariance```, ```cohensd```). Otherwise, the user needs to specify
    the statistics one by one within an array. In this array the user can also specify custom statistics that he
    previously declared in ```/modules/customStatistics.js``` file. They always need to be named starting with
    ```custom-``` (ex: ```custom-twoDimMean```). Futher is an example of implementing a new statistic:
    ```
    var dl = require('datalib');
    global.twoDimMean = function (data, attr1, attr2) {
        var summary1 = dl.summary(data, [attr1])[0];
        var summary2 = dl.summary(data, [attr2])[0];

        var myMean = summary1["mean"] * summary2["mean"];

        return myMean;
    };
    ```
* ```heading``` is the title that the visualization will have.
