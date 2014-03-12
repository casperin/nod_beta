var src = [
    // 'src/cherries.js',  // Pick the ones you need over into generalFunctions.js
    'src/generalFunctions.js',
    'src/checker.js',
    'src/Form.js',
    'src/Elem.js',
    'src/Elems.js',
    'src/main.js'
];

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: src,
                dest: 'build/nod.js',
                options: {
                    banner: ";(function(window, undefined){\n'use strict';",
                    footer: "}(window));"
                }
            }
        },

        plato: {
            your_task: {
                files: { 'plato': src }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>, by <%= pkg.author %> */\n'
            },
            build: {
                src: 'build/nod.js',
                dest: 'build/nod.min.js'
            }
        },

        watch: {
            scripts: {
                files: src,
                tasks: ['concat', 'uglify']
            },
            options: {
                livereload: true,
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-plato');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'plato', 'uglify']);
    grunt.registerTask('default', ['watch']);

};
