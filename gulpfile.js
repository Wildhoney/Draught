(function main() {

    var gulp       = require('gulp'),
        karma      = require('gulp-karma'),
        fs         = require('fs'),
        yaml       = require('js-yaml');

    // Load the YAML configuration file.
    var config = yaml.safeLoad(fs.readFileSync('./draft.yml', 'utf8'));

    gulp.task('karma', function() {

        return gulp.src(['tests/*.test.js', 'src/*.js', 'src/**/*.js'].concat(config.gulp.polyfills))
            .pipe(karma({
                configFile: 'karma.conf.js',
                action: 'run'
            }))
            .on('error', function(error) {
                throw error;
            });

    });

    gulp.task('test', ['karma']);
    gulp.task('default', ['test']);

})();