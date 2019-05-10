# DataScope [![Build Status](https://travis-ci.org/sharmalab/Datascope.svg?branch=dev)](https://travis-ci.org/sharmalab/Datascope) [![DOI](https://zenodo.org/badge/70261830.svg)](https://zenodo.org/badge/latestdoi/70261830) #

We propose an environment for visualizing and exploring multidimensional data. We propose methods to create a new search interface to the data as an alternate way to explore data, create dynamic dashboards that can be extended to support data exploration using Javascript libraries like crossfilter and dc.js. This method is extendible to support data from other remote archives.

### Quickstart guide ###

(requires docker)
* Enter the datascope directory (this directory)
* `docker build -t datascope .`
* `docker run -p 3001:3001 datascope`

### Running Without Containers ###

##### Prerequisites

* Install [Node.js](https://nodejs.org/en/download/) and [NPM](https://www.npmjs.com/get-npm)
* `sudo npm install -g webpack`
* `sudo npm install -g forever` ((Optional) recommended for production deployements)
* `sudo npm install -g apidoc`


##### Installation

* Clone the repository
* Enter the datascope directory (this directory)
* Run ```npm run-script build```

##### Running
* Copy an example config and data folders to this directory from ```examples```
* Modify the files present in ```config``` to fit your needs:
    * dataSource.json
    * dataDescription.json
    * interactiveFilters.json
    * visualization.json
    * dashboard.json (For dashboard settings)

* Run ```node app.js```
* Goto ```http://localhost:3000``` from your favorite browser.

Read the [User Guide](https://github.com/sharmalab/Datascope/wiki)  for more details

##### Recommended production deployement
We recommend deploying Datascope with forever.js.

* Install forever.js `npm install forever -g`
* `forever start app.js`
* `forever ps` gives a list of current instances running. You can get uptime, log details etc.


## Developers

* Use ```webpack --watch``` to rebuild automatically after edits.
* Use ```nodemon```(https://github.com/remy/nodemon) to restart the server automatically after edits.

### API Documentation
Head over to [API Doc](https://sharmalab.github.io/Datascope/apidoc/) for documentation about Datascope's REST API.
