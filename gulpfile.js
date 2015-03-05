(function main() {

    var gulp       = require('gulp'),
        jshint     = require('gulp-jshint'),
        uglify     = require('gulp-uglify'),
        clean      = require('gulp-clean'),
        karma      = require('gulp-karma'),
        rename     = require('gulp-rename'),
        fs         = require('fs'),
        browserify = require('browserify'),
        babelify   = require('babelify');

    /**
     * @property entryFile
     * @type {String}
     */
    var entryFile = './src/Blueprint.js';

    /**
     * @property allFiles
     * @type {String[]}
     */
    var allFiles = ['./src/*.js', './src/**/*.js', './src/**/**/*.js'];

    /**
     * @method buildTo
     * @param {String} destPath
     * @return Object
     */
    var buildTo = function(destPath) {

        return browserify({ debug: true })
            .transform(babelify)
            .require(entryFile, { entry: true })
            .bundle()
            .on('error', function (model) { console.error(['Error:', model.message].join(' ')); })
            .pipe(fs.createWriteStream(destPath));

    };

    gulp.task('compile', function() {
        return buildTo('dist/blueprint.js');
    });

    gulp.task('minify', ['compile'], function() {

        return gulp.src('dist/blueprint.js')
                   .pipe(uglify())
                   .pipe(rename('blueprint.min.js'))
                   .pipe(gulp.dest('dist'));

    });

    gulp.task('vendorify', ['compile'], function() {
        return gulp.src('dist/blueprint.js').pipe(gulp.dest('public/vendor/blueprint'));
    });

    gulp.task('lint', function() {

        return gulp.src(allFiles)
            .pipe(jshint())
            .pipe(jshint.reporter('default', {
                verbose: true
            }));

    });

    gulp.task('karma-prepare', function() {
        return buildTo('tests/build/blueprint.js');
    });

    gulp.task('karma', ['karma-prepare'], function() {

        var deps = ['public/vendor/d3/d3.js', 'public/vendor/lodash/lodash.js'];

        return gulp.src(deps.concat(['tests/*.test.js', 'tests/build/blueprint.js']))
                   .pipe(karma({
                        configFile: 'karma.conf.js',
                        action: 'run'
                   }))
                   .on('error', function(error) {
                        throw error;
                   });

    });

    gulp.task('karma-clean', ['karma'], function () {
        return gulp.src('tests/build/blueprint.js', { read: false }).pipe(clean());
    });

    gulp.task('test', ['lint', 'karma-prepare', 'karma', 'karma-clean']);
    gulp.task('build', ['compile', 'minify', 'vendorify']);
    gulp.task('default', ['test', 'build']);
    gulp.task('watch', function watch() {
        gulp.watch(allFiles, ['build', 'test']);
    });

})();