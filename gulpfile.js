(function main() {

    var gulp       = require('gulp'),
        karma      = require('gulp-karma'),
        jshint     = require('gulp-jshint'),
        fs         = require('fs'),
        yaml       = require('js-yaml'),
        config     = yaml.safeLoad(fs.readFileSync('./draft.yml', 'utf8'));

    gulp.task('karma', function() {

        return gulp.src([].concat(config.polyfills, config.src, config.tests))
                   .pipe(karma({
                       configFile: 'karma.conf.js',
                       action: 'run'
                   }))
                   .on('error', function(error) {
                       throw error;
                   });

    });

    gulp.task('lint', function() {

        return gulp.src(config.src)
                   .pipe(jshint())
                   .pipe(jshint.reporter('default', {
                       verbose: true
                   }));

    });

    gulp.task('test', ['lint', 'karma']);
    gulp.task('default', ['test']);

})();