/**
 * Created by emresakarya on 08.05.16.
 */
var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');
gulp.task('minify', function () {

    gulp.src('./src/main.js')
        .pipe(uglify())
        .pipe(rename({
            suffix:'.min'
        }))
        .pipe(gulp.dest('./dist/'));
});
gulp.task('watch', function () {
    gulp.watch(['./src/main.js'], ['minify']);
});
gulp.task('default', ['minify', 'watch']);