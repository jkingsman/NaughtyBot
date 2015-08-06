var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    minifyCss  = require('gulp-minify-css'),
    concat     = require('gulp-concat'),
    del        = require('del'),
    uglify     = require('gulp-uglify'),
    jshint     = require('gulp-jshint'),
    stylish    = require('jshint-stylish'),
    zip        = require('gulp-zip');

//lint it out
gulp.task('hint', function () {
    gulp.src(['./src/js/background/**/*', './src/js/content_script/**/*', './src/js/popup/**/*'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

//clear out the folder
gulp.task('empty', function() {
    del(['./dest/**', './naughytbot.zip']);
});

// minify our html
gulp.task('html', function () {
    gulp.src('./src/html/*.html')
    .pipe(minifyHtml())
    .pipe(gulp.dest('./dist/'));
});

//minify & concat our CSS
gulp.task('main-css', function () {
    gulp.src('./src/css/*')
    .pipe(minifyCss())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/'));
});

//minify and concat our js

//background
gulp.task('js-background', function () {
    gulp.src('./src/js/background/*')
    .pipe(uglify())
    .pipe(concat('background.js'))
    .pipe(gulp.dest('./dist/'));
});

//content_script
gulp.task('js-content', function () {
    gulp.src('./src/js/content_script/*')
    .pipe(uglify())
    .pipe(concat('content_script.js'))
    .pipe(gulp.dest('./dist/'));
});

//popup
gulp.task('js-popup', function () {
    gulp.src('./src/js/popup/*')
    .pipe(uglify())
    .pipe(concat('popup.js'))
    .pipe(gulp.dest('./dist/'));
});

//lib
gulp.task('js-lib', function () {
    gulp.src(['./src/js/lib/bootstrap.js'])
    .pipe(uglify())
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('./dist/'));
});

//move over remaining files
gulp.task('copy', function () {
    return gulp.src(['./src/audio/**/*', './src/img/**/*', './src/fonts/**/*', './src/manifest.json'], {
        base: 'src'
    }).pipe(gulp.dest('./dist'));
});

gulp.task('zip', ['default'], function () {
    return gulp.src('dist/**/*')
        .pipe(zip('NaughtyBot.zip'))
        .pipe(gulp.dest('./'));
});

//tie it all together
gulp.task('js', ['js-background', 'js-content', 'js-popup','js-lib'])
gulp.task('css', ['main-css'])

//realtime watching
gulp.task('realtime', function() {
  gulp.watch('./src/js/**/*', ['js']);
  gulp.watch('./src/html/**/*', ['html']);
  gulp.watch('./src/css/**/*', ['css']);
  gulp.watch(['./src/img/**/*', './src/fonts/**/*', './src/manifest.json'], ['copy']);
});

gulp.task('watch', ['realtime', 'html', 'css', 'js', 'copy']);
gulp.task('default', ['hint', 'html', 'css', 'js', 'copy']);
