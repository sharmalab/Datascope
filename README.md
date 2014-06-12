#TCIA Data Exploration and Information Visualization#

We propose an environment for visualizing and exploring TCIA data . We leverage TCIA's REST API to programmatically query and download data. We propose methods to create a new search interface to the data as an alternate way to explore the contents of TCIA, create dynamic dashboards that can be extended to support the exploration of TCIA data using Javascript libraries like crossfilter and dc.js. This method is extendible to support data from other remote archives.

### Quick start guide ###

* Install Node.js
* Clone the repository
* Run 
```
#!bash

node app.js
```
 or 
```
#!bash

node app_ajax.js
```

* Goto localhost:3000 or localhost:3000/index3.html(for the AJAX version) from your favorite browser.