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
            zoom: 0.1,
            pageNo: 0,
            search: false
        };
    },
    onZoom: function(event){
        var self = this;
        var zoom = event.target.value;
        console.log(zoom)
        self.setState({zoom: zoom});
    },
    onSearch: function(event){
      var self = this;
      var filter = event.target.value.toLowerCase();
      self.setState({search: filter, pageNo: 0});
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
      if (self.state.pageNo <=0){
        self.setState({
            pageNo: 0
        });
      } else {
        self.setState({
            pageNo: self.state.pageNo-1
        });
      }
    },
    componentDidMount: function(e){
      var self = this;
      document.getElementById("imgrid_search").oninput=function(){
        $(".datatablevis").first().DataTable().search(document.getElementById("imgrid_search").value).draw()
      }


      document.querySelectorAll('[type="search"]')[0].oninput=function(){
        var filter = document.querySelectorAll('[type="search"]')[0].value.toLowerCase()
        var nodes = document.getElementsByClassName('imageGridItem');
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].dataset.label.toLowerCase().includes(filter)) {
            nodes[i].style.display = "inline-block";
          } else {
            nodes[i].style.display = "none";
          }
        }
        document.getElementById("imgrid_search").value = document.querySelectorAll('[type="search"]')[0].value
      }
    },
    onNext: function(e){
        var self = this;
        e.preventDefault();
        self.setState({
            pageNo: self.state.pageNo+1
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
      // specific skip for no path data/slide
      if (d['Pathology']){
        var label = d["label"] || d["TCGA_ID"] || d["Slide IDs"] || d["Slide_ID"] || "Image #" + key
        var image = d["Image"] || "images/jpg/" + label + ".jpg";
        item.image = image;
  			item.key = key;
  			key++;
  			items.push(item);
  			var url = d["url"] || d["Image_URL"] || "https://pathology.cancerimagingarchive.net/pathdata/cptac_camicroscope/osdCamicroscope.php?tissueId=" + label;
              return (

                      <span>
                      <ImageGridItem image={image} url={url} label={label} zoom={self.state.zoom}/>
                      </span>
              );
      }



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
        var Img = images.map(function(d){
          var item = {}
          // specific skip for no path data/slide
          if (d['Pathology']){
            var label = d["label"] || d["TCGA_ID"] || d["Slide IDs"] || d["Slide_ID"] || "Image #" + key
            var image = d["Image"] || "images/jpg/" + label + ".jpg";
            item.image = image;
            item.key = key;
            key++;
            if(!self.state.search || label.indexOf(self.state.search)>=0){
                          items.push(item);
                          var url = d["url"] || d["Image_URL"] || "https://pathology.cancerimagingarchive.net/pathdata/cptac_camicroscope/osdCamicroscope.php?tissueId=" + label;
                                return (

                                        <span id={label+"-img"}>
                                        <ImageGridItem image={image} url={url} label={label} zoom={self.state.zoom}/>
                                        </span>
                          );
            } else {
              return(<span id={label+"-img"}></span>)
            }
          }
        });
        return(

            <div id="imageGrid" >

            <div style={{whiteSpace: "nowrap"}} >
            <span className="HeadBar" style={{width:"60%", display: "inline", padding:"8px", opacity: "0.9", background: "#C9C9D8", lineHeight: "18px", fontSize: "15px"}}>
            Zoom:
<input onChange={self.onZoom} type="range" min="0.1" max="1.2"
            step="0.1" defaultValue={self.state.zoom} style={
                {width: "30%", display: "inline", position: "relative", top: "4.5px"}
        }/>
        Search: <input onChange={self.onSearch} type="text" id="imgrid_search" title="search" style={{width:"60%"}}></input>
          </span>
            </div>

                <div id="imageGridImages">
                        {Img.slice((self.state.pageNo)*100, (self.state.pageNo+1)*100)}
                </div>
               <div id="imageGridPagination">
                    <a href="#" className="prev" onClick={this.onPrev}>Prev</a>
                    <a href="#" className="next" onClick={this.onNext}>Next</a>
                </div>
            </div>

        );
}

});

module.exports = ImageGrid;
