/* global $ */
var React = require("react");


var ImageGridItem = React.createClass({
    render: function() {
        var image = this.props.image;
		//console.log(image);
        var url = this.props.url;
        var zoom = this.props.zoom;
        //var label = this.props.item.label;
        var label = "Label";
        //console.log(zoom);
        var itemStyle = {
            display: "inline-block",
            fontSize: "7px"

        };
        return <div className="imageGridItem" style={itemStyle}>
            <figure>
                <img src={image} style={{zoom: zoom}} /> 
             
            </figure>
        </div>;
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
            zoom: 0.2
        };
    },
    onZoom: function(event){
        var self = this;
        var zoom = event.target.value;
        self.setState({zoom: zoom});
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
            var image = d["Image"];
			item.image = image
            var URL=  image.substring(95, 95+ ("TCGA-A1-AOSD").length);
			item.url = URL;
			item.label = d["TCGA-ID"];
			item.name = d["TCGA-ID"];
			item.key = key;
			key++;
			items.push(item);
			var url = "http://imaging.cci.emory.edu/phone/camicroscope/osdCamicroscope.php?tissueId="+URL;
            return (
                    <span>
                    <a href={"http://imaging.cci.emory.edu/phone/camicroscope/osdCamicroscope.php?tissueId=" + URL} target="_blank"> 

                    <ImageGridItem image={image} url={url} zoom={self.state.zoom}/>
                    </a>
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
        
        if(paginate == true){
            if(gridState == 0){
                return(

                    <div id="imageGrid" >
				<input onChange={self.onZoom} type='range' style={{width:"130px", position: "fixed"}} min='0.1' max='1.5' step='0.1' defaultValue={self.state.zoom}/>
	
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
                    <div id="imageGridImages">
                            {Img}
                    </div>

                </div>

            );     

        }

		
    }


});

module.exports = ImageGrid;


