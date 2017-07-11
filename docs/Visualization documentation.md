We currently support the following visualizations:
1. dataTable
2. bubbleChart
3. imageGrid

### 1. dataTable ###

```
#!json
{
    "type": "dataTable",
    "attributes":[
    	{"name": "id"},
    	{"name": "Ai"},
    	{"name": "Di"}
    ]
}
```

### 2. bubbleChart ###


```
#!json

{
    "type": "bubbleChart",
    "attributes":[
        {
            "name": "a1",
            "type": "x",
            "dimension": true
        },
        {
            "name": "a2",
            "type": "y"
        },
        {
            "name": "a3",
            "type": "color"
        },
        {
            "name": "a4",
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


```
#!json

{
    "type": "imageGrid",
    "attributes":[
        {
            "name": "image",
            "type": "image"
        }
    ],
    "heading": "Image grid",
    "subheading": "Using dummy data"
}
```