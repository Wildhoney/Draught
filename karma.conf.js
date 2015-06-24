module.exports = function(config) {

    config.set({

        basePath: '',
        frameworks: ['jasmine', 'browserify'],
        files: [
            'tests/*.test.js',
            'src/*.js',
            'src/**/*.js',
            'public/vendor/d3/d3.js'
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        //browsers: ['Chrome', 'Opera', 'Safari', 'ChromeCanary', 'Firefox'],
        browsers: ['Chrome'],
        singleRun: false,
        preprocessors: {
            'src/*.js': ['browserify'],
            'src/**/*.js': ['browserify'],
            'tests/*.test.js': ['browserify']
        },
        browserify: {
            debug: true,
            transform: ['babelify']
        }

    });

};