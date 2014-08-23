#Contents
1. [Annotated Source](#markdown-header-annotated-source-code)
2. [Schema definitions](#markdown-header-schemas)
3. [Adding support for new data sources](#markdown-header-adding-support-for-new-data-sources)
4. [Adding support for new visualizations](#markdown-header-adding-support-for-new-visualizations)

#Annotated source code
* [app.js](http://lastlegion.bitbucket.org/app.html)
* [modules/loadDataSource.js](http://lastlegion.bitbucket.org/loadDataSources.html)

#Schemas
* [dataSourceSchema.json](http://lastlegion.bitbucket.org/dataSourceSchema.html)
* [dataDescriptionSchema.json](http://lastlegion.bitbucket.org/dataDescriptionSchema.html)
* [interactiveFilters.json](http://lastlegion.bitbucket.org/interactiveFiltersSchema.html)

#Adding support for new data sources

In ```modules/loadDataSource.js``` we have functions that allow us to obtain data from different data sources. We can extend it add functionality to support newer data sources. The function must have 4 parts:

1. Specification of the path of the data source.
2. Reading from data source(file or REST API).
3. Convert data to JSON.
4. Send data back to the application.
5. Invoke the callback. 

```
#!javascript

function newSource(options, callback){

      // 1 Specify the path of the data source.
      var path = options.path;  

      // 2 Read the file using filepath or make HTTP request
      fs.readFile(path, 'utf8', function(err, d){
        if(err){
          console.log("Error: "+ err);
          return;
        }
        // 3 Convert data into JSON
        data = JSON.parse(d);
        
        // 4 Send data back to app.js
      	exports.data = data;

        // 5 Invoke callback
      	callback();
      });
}

```

#Adding support for new visualizations

Support for new visualizations can be done using these 3 steps: 

1. ***Write functions for rendering visualization***
The ```public/javascripts/visualizations.js``` specifies functions for rendering various visualizations. Every visualization has an ```init``` function(Ex: ```renderImageGridInit()``` etc) and another ```render function )=(Ex: ```renderImageGrid()``` etc.) that gets called up on every filtering request.

2. ***Modify app.js to encapsulate visualization information in results object***
The information required by the client is provided by the server ```app.js```. To embed information in the ```results``` object which is provided by the server and is used by server to know about the current state of filtering. Most visualizations use the ```visualization``` attribute in the ```results``` object. For example the ```imageGrid``` 


        if(visualization.type == "imageGrid")
            results["visualization"] = {values:(dimensions["visualization"].top(100))}

3. ***Register the rendering functions***
Now in ```public/javascripts/main.js``` we have ```renderVisualisation()``` and ```renderVisualizationInit()``` where you need to register your visualization's ```render()``` and ```renderInit()``` functions.

#Adding support for more interactive filters

Have a look at at the [https://github.com/dc-js](dc.js documentation) for creating new dc.js objects. We create *fake dimension* and *fake group* to work with dc.js. The actual crossfilter dimensions and groups are on the server. Following is a sample definition for the dimensions and groups we use on the client side:

```
#!javascript
     dimension = function() {
        return {
            //Called on each filter request on this dimension
            filter: function(f) {
                //makes an ajax request to the server
                refresh(queryFilter, visualAttributes)
            },
            //Called while removing a filter from this dimension
            filterAll: function() {
                delete queryFilter[dim];
                refresh(queryFilter, visualAttributes);
            },
            name: function(){
                return dim;
            }
        }
    }();
    group = function() {
        return {
            //Returns statistics used by dc.js for plotting charts.
            all: function() {
                return filteredData[dim].values;
            },
            order: function() {
                return groups[dim];
            },
            top: function() {
                return filteredData[dim].values;
            }
        }
    }();
```
