#TCIA Data Exploration and Information Visualization#

We propose an environment for visualizing and exploring TCIA data . We leverage TCIA's REST API to programmatically query and download data. We propose methods to create a new search interface to the data as an alternate way to explore the contents of TCIA, create dynamic dashboards that can be extended to support the exploration of TCIA data using Javascript libraries like crossfilter and dc.js. This method is extendible to support data from other remote archives.

### Quick start guide ###

* Install Node.js
* Clone the repository
* Run ```npm install```
* Run ```node app_ajax.js```

* Goto ```http://localhost:3000/index3.html``` from your favorite browser.

### Testing with data ###

* Open ```generate.py``` and change ```num_recs``` to the number of records you want.
* Run ```python generate.py > small-data.json``` to generate a new dataset.
* Run ```node app_ajax.js``` to start playing.