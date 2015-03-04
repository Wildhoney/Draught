(function main() {

    var gulp       = require('gulp'),
        typescript = require('gulp-typescript'),
        flatten    = require('gulp-flatten'),
        concat     = require('gulp-concat'),
        uglify     = require('gulp-uglify'),
        tslint     = require('gulp-tslint');

    var files = ['src/*.ts', 'src/**/*.ts', 'src/**/**/*.ts'];

    gulp.task('compile', function() {

        return gulp.src(files)
            .pipe(typescript({ module: 'amd' }))
            .pipe(concat('blueprint.js'))
            .pipe(flatten())
            .pipe(gulp.dest('dist'))
            .pipe(uglify())
            .pipe(concat('blueprint.min.js'))
            .pipe(gulp.dest('dist'));
    });

    gulp.task('tslint', function(){
        gulp.src(files)
            .pipe(tslint())
            .pipe(tslint.report('verbose'));
    });

    gulp.task('test', ['tslint']);
    gulp.task('build', ['compile']);
    gulp.task('default', ['test', 'build']);

})();