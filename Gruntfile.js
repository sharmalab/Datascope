module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            react: {
                files: ['public/javascripts/*.jsx', 'public/javascripts/**/*.jsx'],
                tasks: ['browserify']
            }
        },

        browserify: {
            options: {
                transform: [ require('grunt-react').browserify ]
            },
            client: {
                src: ['public/javascripts/*.jsx', 'public/javascripts/**/*.jsx'],
                dest: 'public/javascripts/browserify/bundle.js'
            }
        },
        nodemon: {
            dev: {
                script: 'app.js',
                options:{
                    ext:'js,jsx,html,ejs'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', [
        'watch',
        'browserify', 
        'nodemon'
    ]);
};
