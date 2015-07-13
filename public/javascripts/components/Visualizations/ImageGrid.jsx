
var addons = require("react/addons");
var ReactCSSTransitionGroup = addons.CSSTransitionGroup;

var ImageGrid = React.createClass({

    componentWillMount: function(){
        var self =this;
        var currData = this.props.currData;

        console.log(currData);
        self.setState({gridState: 0, currData: currData, images: currData})
    },
    onPrev: function(e){
        var self = this;
        e.preventDefault();
        console.log(this.state.gridState);
        var gridState = this.state.gridState;
        gridState--;
        console.log(gridState);
        $.get("/imageGrid/next?state="+gridState, function(data){

            console.log("..")
            console.log(data);
            self.setState({
                gridState: gridState,
                images: data
            });
        });

    }, 
    onNext: function(e){
        var self = this;
        e.preventDefault();
        console.log(this.state.gridState);
        var gridState = this.state.gridState;
        gridState++;
        console.log(gridState);
        $.get("/imageGrid/next?state="+gridState, function(data){

            console.log("..")
            console.log(data);
            self.setState({
                gridState: gridState,
                images: data
            });
        });

    },
    render: function(){
        var self =this;
        var currData = this.props.currData;
        var data = this.state.images;
        console.log(data);

        var images = data["imageGrid"]["values"];
        var finalState = data["imageGrid"]["finalState"];
        console.log(images)
        console.log(this.state);
        console.log(finalState)
        var gridState = this.state.gridState;   
        var Img = images.map(function(d){
            var image = d["image"];

            return (
                

                    <img src={image} width="60px" height="60px" style={{margin: "2px"}}/>
        
            );


        });
        if(gridState == 0){
            return(

                <div id="imageGrid" >
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

    }
});

module.exports = ImageGrid;


