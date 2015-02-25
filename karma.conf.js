module.exports = function(config) {

    config.set({

        basePath: '',
        frameworks: ['jasmine', 'requirejs'],
        files: [
            'test-main.js',
            { pattern: 'tests/*.test.js', included: false },
            { pattern: 'tests/**/*.test.js', included: false },
            { pattern: 'tests/build/*.js', included: false }
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome', 'Safari', 'ChromeCanary', 'Firefox'],
        singleRun: false

    });

};