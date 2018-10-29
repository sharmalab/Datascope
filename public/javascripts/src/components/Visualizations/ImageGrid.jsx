/* global $ */
var React = require("react");


var ImageGridItem = React.createClass({
    render: function() {
        var image = this.props.image;
		//console.log(image);
        var url = this.props.url;
        var zoom = this.props.zoom;
        var label = this.props.label;
        //var label = "Label";
        //console.log(zoom);
        var itemStyle = {
            display: "inline-block",
            fontSize: "7px"

        };
        return <a href={url} target="_blank">
          <div className="imageGridItem" data-label={label} style={itemStyle}>
              <figure>
                  <img src={image} style={{width: (zoom*120 + 30)}} />
                  <p className="imagelabel">{label}</p>
              </figure>
          </div>
        </a>;
	}
});

var ImageGrid = React.createClass({
    getInitialState: function(){
        var self =this;
        var currData = this.props.currData;
        //self.setState({gridState: 0, currData: currData, images: currData, zoom:0.3});

        return {
            gridState: 0,
            currData: currData,
            zoom: 0.1
        };
    },
    onZoom: function(event){
        var self = this;
        var zoom = event.target.value;
        console.log(zoom)
        self.setState({zoom: zoom});
    },
    onSearch: function(event){
      var filter = event.target.value.toLowerCase();
      var nodes = document.getElementsByClassName('imageGridItem');

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].dataset.label.toLowerCase().includes(filter)) {
          nodes[i].style.display = "inline-block";
        } else {
          nodes[i].style.display = "none";
        }
      }
    },
    componentWillReceiveProps: function(){
        var self =this;
        var currData = this.props.currData;
        var paginate = this.props.currData["imageGrid"].paginate;
        //console.log(currData);
        //console.log("reciveing props woot");
        self.setState({gridState: 0, currData: currData, images: currData, paginate: paginate});

    },
    onPrev: function(e){
        var self = this;
        e.preventDefault();
        var gridState = this.state.gridState;
        gridState--;

        $.get("/imageGrid/next?state="+gridState, function(data){

            self.setState({
                gridState: gridState,
                images: data
            });
        });

    },
    onNext: function(e){
        var self = this;
        e.preventDefault();
        var gridState = this.state.gridState;
        gridState++;
        $.get("/imageGrid/next?state="+gridState, function(data){

            self.setState({
                gridState: gridState,
                images: data
            });
        });

    },

    render: function(){
        var self = this;
		var displayObject = (<ImageGridItem />);
        //console.log("rendering imageGrid");
        //console.log(this.props.debug);
        //var self =this;
        var currData = this.props.currData;
        //var currData = this.state.currData;
        //var data = this.state.images;
        //console.log(currData["imageGrid"]["values"].length);
        var images = currData["imageGrid"]["values"];
        var finalState = currData["imageGrid"]["finalState"];
        var gridState = this.state.gridState;
        var paginate = this.state.paginate;
        //console.log(currData);
        //console.log(this.state.gridState)

        var items = [];
        var key = 1;
        var Img = images.map(function(d){
			var item = {}
      var image = d["image"];
      var label = d["label"] || d["TCGA_ID"] || d["SlideID"] || d["Slide ID"] || "Image #" + key
			item.image = image;
			item.key = key;
			key++;
			items.push(item);
			var url = d["url"] || d["Image_URL"];
            return (

                    <span>
                    <ImageGridItem image={image} url={url} label={label} zoom={self.state.zoom}/>
                    </span>
            );


        });
		/*
        return (
			<div>
			<AbsoluteGrid
					items={items}
				   	displayObject={displayObject}
				   	responsive={true}
				   	verticalMargin={42}
				   	itemWidth={180}
				   	itemHeight={80} />
			</div>
		);
		*/
        console.log("Paginate: ");
        console.log(paginate);
        if(paginate == true){
            if(gridState == 0){
                return(

                    <div id="imageGrid" >

                    <div style={{whiteSpace: "nowrap"}} >
                    <span  style={{width:"140px", position: "fixed", display: "inline", padding:"2px", opacity: "0.7", background: "#fff", lineHeight: "18px", fontSize: "8px"}}>
                    Zoom:
				<input onChange={self.onZoom} type="range" min="0.1" max="1.5"
                    step="0.1" defaultValue={self.state.zoom} style={
                        {width: "100px", display: "inline", position: "relative", top: "4.5px"}
                }/>
                Search: <input onChange={self.onSearch} type="text" id="imgrid_search" title="search"></input>
	                </span>
                    </div>



                        <div id="imageGridImages">
                                {Img}
                        </div>
                       <div id="imageGridPagination">
                            <a href="#" className="next" onClick={this.onNext} >Next</a>
                        </div>
                    </div>

                );
            } else if(gridState == finalState) {

                return(
                    <div id="imageGrid" >
                    <div style={{whiteSpace: "nowrap"}} >
                    <span  style={{width:"140px", position: "fixed", display: "inline", padding:"2px", opacity: "0.7", background: "#fff", lineHeight: "18px", fontSize: "8px"}}>
                    Zoom:
				<input onChange={self.onZoom} type="range" min="0.1" max="1.5"
                    step="0.1" defaultValue={self.state.zoom} style={
                        {width: "100px", display: "inline", position: "relative", top: "4.5px"}
                }/>
                                Search: <input onChange={self.onSearch} type="text" id="imgrid_search" title="search"></input>
	                </span>
                    </div>

                        <div id="imageGridImages">
                                {Img}
                        </div>
                       <div id="imageGridPagination">
                            <a href="#" className="prev" onClick={this.onPrev}>Prev</a>
                        </div>
                    </div>
                );
            } else {
                return(
                    <div id="imageGrid" >
                    <div style={{whiteSpace: "nowrap"}} >
                    <span  style={{width:"140px", position: "fixed", display: "inline", padding:"2px", opacity: "0.7", background: "#fff", lineHeight: "18px", fontSize: "8px"}}>
                    Zoom:
				<input onChange={self.onZoom} type="range" min="0.1" max="1.5"
                    step="0.1" defaultValue={self.state.zoom} style={
                        {width: "100px", display: "inline", position: "relative", top: "4.5px"}
                }/>
                                Search: <input onChange={self.onSearch} type="text" id="imgrid_search" title="search"></input>
	                </span>
                    </div>
                        <div id="imageGridImages">
                                {Img}
                        </div>
                       <div id="imageGridPagination">
                            <a href="#" className="prev" onClick={this.onPrev}>Prev</a>
                            <a href="#" className="next" onClick={this.onNext}>Next</a>
                        </div>
                    </div>
                );
            }

        } else {
            return(

                <div id="imageGrid" >
                    <div style={{whiteSpace: "nowrap"}} >
                    <span  style={{width:"140px", position: "fixed", display: "inline", padding:"2px", opacity: "0.7", background: "#fff", lineHeight: "18px", fontSize: "8px"}}>
                    Zoom:
				<input onChange={self.onZoom} type="range" min="0.1" max="1.5"
                    step="0.1" defaultValue={self.state.zoom} style={
                        {width: "100px", display: "inline", position: "relative", top: "4.5px"}
                }/>
                                Search: <input onChange={self.onSearch} type="text" id="imgrid_search" title="search"></input>
	                </span>
                    </div>
                    <div id="imageGridImages">
                            {Img}
                    </div>

                </div>

            );

        }


    }


});

module.exports = ImageGrid;
