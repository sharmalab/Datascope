module.exports = {
    entry: "./public/javascripts/src/App.jsx",
    output: {
        filename: "./public/javascripts/browserify/bundle.js"
    },
    module: {
        rules:[
            {
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                loader: "babel-loader?presets[]=react&presets=es2015"
            },
            {
                test: /masonry|imagesloaded|fizzy\-ui\-utils|desandro\-|outlayer|get\-size|doc\-ready|eventie|eventemitter3/,
                loader: "imports-loader?define=>false&this=>window"
            }
        ]
    }
};
