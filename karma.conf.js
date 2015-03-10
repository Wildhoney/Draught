module.exports = function(config) {

    config.set({

        basePath: '',
        frameworks: ['jasmine'],
        files: [
            { pattern: 'tests/*.test.js', included: false },
            { pattern: 'dist/blueprint.js', included: false }
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome', 'Safari', 'ChromeCanary', 'Firefox'],
        //browsers: ['Firefox'],
        singleRun: false

    });

};