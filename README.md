# DataScope [![Build Status](https://travis-ci.org/sharmalab/Datascope.svg?branch=dev)](https://travis-ci.org/sharmalab/Datascope) [![DOI](https://zenodo.org/badge/70261830.svg)](https://zenodo.org/badge/latestdoi/70261830) #

We propose an environment for visualizing and exploring multidimensional data. We propose methods to create a new search interface to the data as an alternate way to explore data, create dynamic dashboards that can be extended to support data exploration using Javascript libraries like crossfilter and dc.js. This method is extendible to support data from other remote archives.

### Quick start guide ###

##### Prerequisites

* Install Node.js and NPM
* `npm install -g webpack`
* `npm install -g forever` ((Optional) recommended for production deployements)


##### Installation

* Clone the repository
* Run ```npm install```
* Run ```webpack```

##### Running

* Modify the files present in ```public/config``` to fit your needs:
    * dataSource.json (Refer to [dataSource.json documentation](https://bitbucket.org/BMI/interactive-data-exporation/wiki/dataSource.json))
    * dataDescription.json (Refer to [dataDescription.json documentation](https://bitbucket.org/BMI/interactive-data-exporation/wiki/dataDescription.json))
    * interactiveFilters.json (Refer to [interactiveFilters.json documentation](https://bitbucket.org/BMI/interactive-data-exporation/wiki/interactiveFilters.json))
    * visualization.json (Refer to [visualization.json documentation](https://bitbucket.org/BMI/interactive-data-exporation/wiki/visualization.json))
    * dashboard.json (For dashboard settings)

* Run ```node app.js```
* Goto ```http://localhost:3000``` from your favorite browser.

Read the User Guide present in ```docs/wiki/``` for more details


## Developers

* Use ```webpack --watch``` to rebuild automatically after edits.
* Use ```nodemon```(https://github.com/remy/nodemon) to restart the server automatically after edits. 

### API Documentation
Head over to (https://sharmalab.github.io/Datascope/apidoc/)[API Doc] for documentation about Datascope's REST API.

