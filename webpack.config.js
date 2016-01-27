module.exports = {
    entry: "./public/javascripts/src/App.jsx",
    output: {
        filename: "./public/javascripts/browserify/bundle.js"
    },
    module: {
        loaders:[
            {
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                loader: "babel?presets[]=react&presets=es2015"
            },
            {
                test: /masonry|imagesloaded|fizzy\-ui\-utils|desandro\-|outlayer|get\-size|doc\-ready|eventie|eventemitter3/,
                loader: "imports?define=>false&this=>window"
            }
        ]
    }
};
