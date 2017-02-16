/*jshint node:true */

// Generated on 2014-01-02 using generator-angular 0.7.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

/**
 * Read the ivy credentials on jenkins and return the content as a hash.
 * That way we can push the generated zip file at the place as the other scala dist files.
 * @return {Object} the hash containing the credentials.
 */
function readIvyCredentials() {
  var fs = require("fs");
  var path = require("path");
  var properties = require("properties");

  var credsFile = path.join(process.env.HOME, ".ivy2", ".credentials");
  try {
    return properties.parse(fs.readFileSync(credsFile).toString());
  } catch (e) {
    return {};
  }
}

module.exports = function (grunt) {

  var nexusCreds = readIvyCredentials();

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);
  grunt.loadNpmTasks('grunt-regex-replace');

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.loadNpmTasks('grunt-shell');

  // var version = grunt.file.readJSON("package.json").version;
  var version = "1.0-build-" + (process.env.BUILD_NUMBER || "DEV") + "-rev-" + require('child_process').execSync("git rev-parse --short HEAD").toString().trim();

  var isSnapshot = version.indexOf("SNAPSHOT") !== -1;

  var webpack = require('webpack');
  var webpackMiddleware = require("webpack-dev-middleware");
  var webpackDevConfig = require('./config/webpack.config.dev.js');
  var paths = require('./config/paths');

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    compress: {
      main: {
        options: {
          archive: 'navigator.zip'
        },
        expand: true,
        src: ['**/*', '.tmp/**/*'],
        dest: './',
        cwd: 'dist',
        pretty: true
      }
    },

    nexusDeployer: {
      release: {
        options: {
          groupId: "com.mediarithmics.web",
          artifactId: "navigator",
          version: version,
          packaging: 'zip',
          auth: {
            username: nexusCreds.user,
            password: nexusCreds.password
          },
          pomDir: 'generated/pom',
          url: 'https://' + nexusCreds.host + '/content/repositories/' + (isSnapshot ? 'snapshots' : 'releases'),
          artifact: 'navigator.zip'
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= yeoman.app %>/angular/src/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      genRequireJsFiles: {
        files: ['/app/**/module.json'],
        tasks: ['genRequireJsFiles:config']
      },

      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['genRequireJsFiles:config']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/*.html',
          '<%= yeoman.app %>/angular/src/**/*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729,
        middleware: function(connect, options, middlewares) {
          middlewares.unshift(webpackMiddleware(webpack(webpackDevConfig), { publicPath: paths.publicPath }));
          return middlewares;
        }
      },
      livereload: {
        options: {
          open: false,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/angular/src/**/*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**/*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              'navigator.zip',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },


    // Automatically inject Bower components into the app
    bowerInstall: {
      target: {
        src: ['<%= yeoman.app %>/index.html'],
        exclude: [
          'angular/bower_components/bootstrap/dist/css/bootstrap.css', // this is `@import`ed in the scss file
          'angular/bower_components/bootstrap-sass/assets/javascripts/bootstrap/*' // already included in the file angular/bower_components/bootstrap/dist/js/bootstrap.js
        ]
      }
    },


    // Renames files for browser caching purposes
    filerev: {
      files: {
        src: [
          '<%= yeoman.dist %>/angular/src/**/*.js',
          '<%= yeoman.dist %>/scripts/**/*.js',
          '<%= yeoman.dist %>/styles/**/*.css',
          '<%= yeoman.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }

    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: [
        '<%= yeoman.dist %>/angular/src/**/*.html',
        '<%= yeoman.dist %>/*.html'
      ],
      css: ['<%= yeoman.dist %>/styles/**/*.css'],
      js: ['<%= yeoman.dist %>/scripts/*.js'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>'],
        root: '<%= yeoman.dist %>',
        patterns: {
          js: [
            [/(images\/.*?\.png)/g, 'Replacing reference to images/*.png']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '**/*.{png,jpg,jpeg,gif}',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },

    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.svg',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: ['*.html', 'angular/src/**/*.html'],
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },

// Allow the use of non-minsafe AngularJS files. Automatically makes it
// minsafe compatible so Uglify does not destroy the ng references
//    ngmin: {
//      dist: {
//        files: [{
//          expand: true,
//          cwd: '.tmp/concat/scripts',
//          src: '*.js',
//          dest: '.tmp/ngmin/scripts'
////          dest: '<%= yeoman.dist %>/scripts'
//        }]
//      }
//    },


    requirejs: {
      dist: {
        options: {
          waitSeconds: 0,
          baseUrl: "app/angular/src",
          mainConfigFile: "app/main.js",
          name: "navigator",
          optimize: "none",
          insertRequire: ['app'],
          paths: {
            'core/configuration': 'empty:'
          },
          out: ".tmp/concat/scripts/main.js"
        }
      }
    },

    uglify: {
      options: {
        mangle: false,
        compress: true,
        sourceMap: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/scripts',
            src: '*.js',
            dest: '<%= yeoman.dist %>/scripts'
          }
        ]

      }
    },

    shell: {
      iab_placeholder: {
        command: function () {
          return "<%= yeoman.app %>/images/generate_iab_placeholders.sh <%= yeoman.app %>/images/flash/Adobe-swf_icon.png";
        }
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              '*.html',
              'angular/src/**/*.html',
              'angular/bower_components/**/*',
              'angular/src/**/*.{jpe?g,png}',
              'fonts/*'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= yeoman.dist %>/images',
            src: ['generated/*']
          },
          {
            expand: true,
            cwd: '.tmp',
            dest: '<%= yeoman.dist %>/.tmp',
            src: ['concat/**/*'] // add the "source" files used by uglify to generate the source map
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/angular/bower_components/video.js/dist/video-js/font/',
            dest: '<%= yeoman.dist %>/styles/font',
            src: '*'
          }
        ]
      },
      generated_iab: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              'images/flash/generated/*'
            ]
          }
        ]
      },
      // TODO : Find why this doesn't work
//      require: {
//        files: [{
//          expand: true,
//            dot: true,
//            cwd: '<%= yeoman.app %>',
//            dest: '<%= yeoman.dist %>/scripts/vendor',
//            src: [ 'angular/bower_components/require/require.js']
//        }]
//      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    'regex-replace': {
      dist: {
        src: ['<%= yeoman.dist %>/index.html'],
        actions: [
          {
            name: 'requirejs-newpath',
            search: '<script data-main=".*" src="angular/bower_components/requirejs/require.js"></script>',
            replace: function (match) {
              var regex = /data-main="(.*)" /;
              var result = regex.exec(match);
              var revFileName = grunt.filerev.summary['dist/scripts/' + result[1]].replace('dist', '');
              return '<script data-main="' + revFileName + '" src="angular/bower_components/requirejs/require.js"></script>';
            }

          }
        ]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/angular/src',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/angular/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    genRequireJsFiles: {
      config: {
        src: '<%= yeoman.app %>/angular/src/**/module.json',
        template: 'define([{{{requires}}}],function(){});',
        templateModule: 'define(["angular"],function(){' +
        '"use strict";' +
        'return angular.module("{{{name}}}", [{{{dependencies}}}]);' +
        '});'
      }
    }
  });

  grunt.registerTask('versionFile', function () {
    var path = require("path");
    grunt.file.write(path.join(grunt.config('yeoman.dist'), "version.txt"), version);
  });

  grunt.registerMultiTask('genRequireJsFiles', function () {
    var fs = require('fs');
    var path = require('path');
    var Mustache = require('mustache');
    var _ = require('lodash');

    this.filesSrc.forEach(function (filepath) {
      var content = JSON.parse(fs.readFileSync(filepath));
      var dirname = path.dirname(filepath);
      var jsToInclude = _.without(_.filter(fs.readdirSync(dirname), function (val) {
        return val.match(/\.js$/);
      }).map(function (v) {
        return "./" + v.replace(/\.js$/g, '');
      }), "./index", "./module");

      content.requiresJs = content.dependencies.concat(jsToInclude);
      var models = {
        name: content.name,
        dependencies: _.map(content.dependencies, function (v) {
          return "\"" + v + "\"";
        }).join(","),
        requires: _.map(content.requiresJs, function (v) {
          if (!v.match(/\.js$/)) {
            if (v.match(/^core/)) {
              return "\"" + v + "/index\"";
            }
          }
          return "\"" + v + "\"";

        }).join(",")
      };

      var indexJs = Mustache.render(grunt.config("genRequireJsFiles.config.template"), models);
      var moduleJs = Mustache.render(grunt.config("genRequireJsFiles.config.templateModule"), models);

      fs.writeFileSync(dirname + "/index.js", indexJs);
      fs.writeFileSync(dirname + "/module.js", moduleJs);
    });
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'jshint:all',
      'shell:iab_placeholder',
      'genRequireJsFiles:config',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', [
    'clean:server',
    'jshint:all',
    'genRequireJsFiles:config',
    'concurrent:test',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint:all',
    'shell:iab_placeholder',
    'useminPrepare',
    'genRequireJsFiles:config',
    'requirejs',
    'concurrent:dist',
    'concat',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'regex-replace:dist',
    'usemin',
    'copy:generated_iab',
    'htmlmin',
    'versionFile',
    'compress'
  ]);

  grunt.registerTask('publish', [
    'build',
    'nexusDeployer'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'build'
  ]);
};
