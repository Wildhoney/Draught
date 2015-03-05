(function main() {

    var gulp       = require('gulp'),
        jshint     = require('gulp-jshint'),
        uglify     = require('gulp-uglify'),
        clean      = require('gulp-clean'),
        karma      = require('gulp-karma'),
        rename     = require('gulp-rename'),
        fs         = require('fs'),
        yaml       = require('js-yaml'),
        browserify = require('browserify'),
        babelify   = require('babelify');

    // Load the YAML configuration file.
    var config = yaml.safeLoad(fs.readFileSync('./.blueprint.yml', 'utf8'));

    // Common entry values.
    var entryFile = config.gulp.entry,
        allFiles  = config.gulp.all,
        prodPath  = config.gulp.directories.dist + '/' + config.gulp.names.prod;

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
        return buildTo(prodPath);
    });

    gulp.task('minify', ['compile'], function() {

        return gulp.src(prodPath)
                   .pipe(uglify())
                   .pipe(rename(config.gulp.names.dev))
                   .pipe(gulp.dest(config.gulp.directories.dist));

    });

    gulp.task('vendorify', ['compile'], function() {
        return gulp.src(prodPath).pipe(gulp.dest(config.gulp.directories.vendor));
    });

    gulp.task('lint', function() {

        return gulp.src(allFiles)
                   .pipe(jshint())
                   .pipe(jshint.reporter('default', {
                       verbose: true
                   }));

    });

    gulp.task('karma-prepare', function() {
        return buildTo(config.gulp.tests.temp);
    });

    gulp.task('karma', ['karma-prepare'], function() {

        return gulp.src(config.gulp.dependencies.concat(['tests/*.test.js', config.gulp.tests.temp]))
                   .pipe(karma({
                        configFile: 'karma.conf.js',
                        action: 'run'
                   }))
                   .on('error', function(error) {
                        throw error;
                   });

    });

    gulp.task('karma-clean', ['karma'], function () {
        return gulp.src(config.gulp.tests.temp, { read: false }).pipe(clean());
    });

    gulp.task('test', ['lint', 'karma-prepare', 'karma', 'karma-clean']);
    gulp.task('build', ['compile', 'minify', 'vendorify']);
    gulp.task('default', ['test', 'build']);
    gulp.task('watch', function watch() {
        gulp.watch(allFiles, ['build', 'test']);
    });

})();