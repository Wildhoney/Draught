(function main() {

    var gulp       = require('gulp'),
        jshint     = require('gulp-jshint'),
        uglify     = require('gulp-uglify'),
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

    gulp.task('compile', function() {

        return browserify({ debug: true })
                .transform(babelify)
                .require(entryFile, { entry: true })
                .bundle()
                .on('error', function (model) { console.error(['Error:', model.message].join(' ')); })
                .pipe(fs.createWriteStream('dist/blueprint.js'));

    });

    gulp.task('minify', ['compile'], function() {

        return gulp.src('dist/blueprint.js')
            .pipe(uglify())
            .pipe(rename('blueprint.min.js'))
            .pipe(gulp.dest('dist'));

    });

    gulp.task('lint', function() {

        return gulp.src(allFiles)
            .pipe(jshint())
            .pipe(jshint.reporter('default', {
                verbose: true
            }));

    });

    gulp.task('test', ['lint']);
    gulp.task('build', ['compile', 'minify']);
    gulp.task('default', ['test', 'build']);
    gulp.task('watch', function watch() {
        gulp.watch(allFiles, ['build', 'test']);
    });

})();