"use strict";
const gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('gulp-autoprefixer'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    newer = require('gulp-newer'),
    debug = require('gulp-debug'),
    gulpIf = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    smushit = require('gulp-smushit'),
    del = require('del'),
    replace = require('gulp-url-replace'),
    gulpBowerFiles = require('gulp-main-bower-files'),
    browserSync = require('browser-sync').create(),
    path = require('path');
var svgSprite = require('gulp-svg-sprites');


//npm i gulp-postcss gulp-autoprefixer gulp-rigger gulp-uglify gulp-less gulp-sourcemaps gulp-newer gulp-debug gulp-if gulp-imagemin gulp-smushit del gulp-url-replace gulp-main-bower-files browser-sync path gulp-svg-sprites --save-dev

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
const cms = {
    nocms:{
        html: 'build',
        css: 'build/css',
        js: 'build/js',
        img: 'build/images',
        libs: 'build/libs',
        fonts: 'build/fonts',
        svg: 'build/svg',
        url: {
            'libs/': 'libs/',
            'images/': 'images/',
            'css/': 'css/',
            'js/': 'js/',
            'fonts/': 'fonts/',
            'svg/':'svg/'
        }
    },
    modx: {
        html: 'build',
        css: 'build/assets/css',
        js: 'build/assets/js',
        img: 'build/assets/images',
        libs: 'build/assets/libs',
        fonts: 'build/assets/fonts',
        sprites:'build/assets/svg',
        url: {
            'libs/': 'assets/libs/',
            'img/': 'assets/images/',
            'css/': 'assets/css/',
            'js/': 'assets/js/',
            'fonts/': 'assets/fonts/',
            'svg/': 'assets/svg/'
        }
    },
    wordpress: {
        html: 'build',
        css: 'build/wp-theme/css',
        js: 'build/wp-theme/js',
        img: 'build/wp-theme/images',
        libs: 'build/wp-theme/libs',
        fonts: 'build/wp-theme/fonts',
        url: {
            'libs/': 'wp-theme/libs/',
            'img/': 'wp-theme/images/',
            'css/': 'wp-theme/css/',
            'js/': 'wp-theme/js/',
            'fonts/': 'wp-theme/fonts/'
        }
    }
};

//Html task
gulp.task('html', function () {
    return gulp.src('src/*.html')
        .pipe(rigger())
        .pipe(replace(cms.nocms.url))
        .pipe(gulp.dest(cms.nocms.html))
        .pipe(browserSync.stream());
});
//Style task
gulp.task('style', function () {
    var processors = [
        autoprefixer
    ];
    return gulp.src('src/css/*.less')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(less())
        .pipe(postcss(processors))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest(cms.nocms.css))
        .pipe(gulp.dest('src/css/'))
        .pipe(browserSync.stream());

});
//SPRITES task
gulp.task('sprites', function () {
    return gulp.src('src/svg/*.svg')
        //.pipe(svgSprite())
        //.pipe(newer(cms.nocms.svg))
        .pipe(gulp.dest(cms.nocms.svg));
});

//JS task
gulp.task('js', function () {
    return gulp.src('src/js/main.js')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(rigger())
        .pipe(gulpIf(!isDevelopment, uglify()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest(cms.nocms.js))
        .pipe(browserSync.stream());
});
//Libs task
gulp.task('libs', function () {
    return gulp.src('bower.json')
        .pipe(gulpBowerFiles())
        .pipe(newer(cms.nocms.libs))
        .pipe(gulp.dest(cms.nocms.libs))
});

//Fonts task
gulp.task('fonts', function () {
    return gulp.src('src/fonts/**/*')
        .pipe(newer(cms.nocms.fonts))
        .pipe(debug())
        .pipe(gulpIf(isDevelopment, gulp.dest(cms.nocms.fonts)))
});
//IMG task
gulp.task('img', function () {
    return gulp.src('src/images/**/*', {since: gulp.lastRun('img')})
        .pipe(newer(cms.nocms.img))
        .pipe(gulp.dest(cms.nocms.img)); //add this line for no compress problems with svg
        //.pipe(gulpIf(!isDevelopment, imagemin({progressive: true})))
        // .pipe(gulpIf(!isDevelopment, smushit({verbose: true})))
        //.pipe(gulpIf(isDevelopment, gulp.symlink(cms.nocms.img), gulp.dest(cms.nocms.img)));
});
//Del build
gulp.task('clean', function () {
    return del('build');
});
//Watchers
gulp.task('watch', function () {
    gulp.watch('src/**/*.html', gulp.series('html'));
    gulp.watch('src/css/**/*.less', gulp.series('style'));
    gulp.watch('src/js/*.js', gulp.series('js'));
    gulp.watch('src/images/**/*', gulp.series('img'));
});
//Browser-sync task
gulp.task('serve', function () {
    browserSync.init({
        proxy: "miss.loc",
        browser: "chrome",
        open: false
    });
});


//GLOBAL TASKS
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'style', 'js', 'libs', 'fonts', 'img', 'sprites')));
gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
