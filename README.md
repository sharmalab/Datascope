# DataScope [![Build Status](https://travis-ci.org/sharmalab/Datascope.svg?branch=dev)](https://travis-ci.org/sharmalab/Datascope) [![DOI](https://zenodo.org/badge/70261830.svg)](https://zenodo.org/badge/latestdoi/70261830) #

We propose an environment for visualizing and exploring multidimensional data. We propose methods to create a new search interface to the data as an alternate way to explore data, create dynamic dashboards that can be extended to support data exploration using Javascript libraries like crossfilter and dc.js. This method is extendible to support data from other remote archives.

### Quick start guide ###

##### Prerequisites

* Install [Node.js](https://nodejs.org/en/download/) and [NPM](https://www.npmjs.com/get-npm)
* `npm install -g webpack`
* `npm install -g forever` ((Optional) recommended for production deployements)
* `npm install -g apidoc` ((Optional) for building documentation)


##### Installation

* Clone the repository
* Run ```npm run-script build```

##### Running

* Modify the files present in ```config``` to fit your needs:
    * dataSource.json 
    * dataDescription.json 
    * interactiveFilters.json
    * visualization.json
    * dashboard.json (For dashboard settings)

* Run ```node app.js```
* Goto ```http://localhost:3000``` from your favorite browser.

Read the [User Guide](https://github.com/sharmalab/Datascope/wiki)  for more details

##### Druid

* Run `addTime.js <input> <output> <datasourcename>` to convert an existing json file into a line-by-line json with proxy timestamp added to each record. It'll also generate the druid spec in stdout.

* Open the spec in vim and modify dimensions etc.

* `curl -X "POST" -H "Content-Type:application/json" -d @spec.json localhost:8090/druid/indexer/v1/task`


## Developers

* Use ```webpack --watch``` to rebuild automatically after edits.
* Use ```nodemon```(https://github.com/remy/nodemon) to restart the server automatically after edits. 

### API Documentation
Head over to [API Doc](https://sharmalab.github.io/Datascope/apidoc/) for documentation about Datascope's REST API.

