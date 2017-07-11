### Setting up the app ###

1. Install Node.js
2. Clone the repository run ```git clone https://lastlegion@bitbucket.org/BMI/interactive-data-exporation.git```
3. Run ```npm install``` 

### Configuring ###

The configuration files are available at ```public/config```. There are 4 configuration files:

1. ***dataSource.json***
The ```dataSource.json``` file specifies information about the data repository. Refer to the [dataSource.json documentation](dataSource.json) for a detailed description.

2. ***dataDescription.json***
The ```dataDescription.json``` file specifies information regarding each attribute in the data. An attribute could be ```visual```, ```filtering``` or ```key```. Refer to [dataDescription.json documentation](dataDescription.json)

3. ***interactiveFilters.json***
Specifies information for interactive filters that appear on the left side of the dashboard. Refer to [interactiveFilters.json documentation](interactiveFilters.json)

4. ***visualization.json***
Specify the type of visualization that shall appear on the main display panel. Refer to [visualization.json documentation](visualization.json)


Modify these files to suit your needs.

### Running ###
Run ```node app.js``` to get the application server started.
Goto ```localhost:3000``` to see your dashboard.