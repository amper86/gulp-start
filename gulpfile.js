const gulp = require('gulp');

//pug
const pug = require("gulp-pug");

//scss
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const groupMediaQueries = require('gulp-group-css-media-queries');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');

//js без webpack
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

//вспомогательные плагины
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const del = require('del');

//сжатие картинок
const imagemin = require('gulp-imagemin');

//js с webpack
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

//пути app - разработка, build - готовая сборка

const paths = {
    app: './app/',
    build: './dist/'
};

//pug

gulp.task('htmls', function () {
    return gulp.src(paths.app + 'pug/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(paths.build));
});

//scss

gulp.task('styles', function () {
    return gulp.src(paths.app + 'scss/main.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(autoprefixer(['last 2 versions'], { cascade: false }))
        .pipe(groupMediaQueries())
        .pipe(csso())
        .pipe(rename({ suffix: ".min"}))
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest(paths.build + 'css/'));
});

//js сборка без webpack

gulp.task('js', function () {
    return gulp.src(paths.app + 'js/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(concat('script.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.build + 'js/'))
});

//js c webpack

/*gulp.task('js', function () {
    return gulp.src(paths.app + 'js/app.js')
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(gulp.dest(paths.build + 'js/'))
});*/

//images min

gulp.task('images', function () {
    return gulp.src(paths.app + 'images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(paths.build + 'images/'))
});

gulp.task('fonts', function () {
    return gulp.src(paths.app + 'fonts/**/*')
        .pipe(gulp.dest(paths.build + 'fonts/'))
});

//browser-sync

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: paths.build
        }
    });
    browserSync.watch(paths.build + '**/*.*').on('change', browserSync.reload);
});

//очистка

gulp.task('clean', function () {
    return del('dist/')
});

//watch pug, scss, js

gulp.task('watch', function () {
    gulp.watch( paths.app + 'pug/**/*.pug', gulp.series('htmls'));
    gulp.watch( paths.app + 'scss/**/*.scss', gulp.series('styles'));
    gulp.watch( paths.app + 'js/**/*.js', gulp.series('js'));
});

//gulp

gulp.task('default', gulp.series(
    'clean',
    gulp.parallel('htmls', 'styles', 'js', 'images', 'fonts'),
    gulp.parallel('watch', 'serve')
));