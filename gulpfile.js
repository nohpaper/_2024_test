"use strict";
var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');

var fileinclude = require('gulp-file-include');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserSyncPCA;

/**
 * DIRECTORY
 */
var root = "./public";
var language = {
    ko : "/en"
};
var type = {
    pcA : "/pc"
};
var srcRoot = "/src", //작업 폴더
    distRoot = "/dist"; //배포 폴더
var paths = { //작업&배포 폴더 트리 구조
    html: "/html",
    stylesheets : "/stylesheets",
    css : "/css",
    sass : "/sass",
    script : "/javascripts",
    map : "../../map",
    images : "/images"
};
var typeRoot = {
    srcPcA : root + language.ko + type.pcA + srcRoot, //typeRoot.srcPc 배포
    distPcA : root + language.ko + type.pcA + distRoot
};

/**
 * html copy
 */
var htmlCopyFun = function(o){
    return gulp.src([
        root + o.language + o.type + srcRoot + "/**/**/*.html",
        root + o.language + o.type + srcRoot + "/!include/*.html"
    ])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(root + o.language + o.type + distRoot))
};
gulp.task('pcA-html-copy',async function(){htmlCopyFun({language : language.ko, type : type.pcA});});

/**
 * SASS
 */
var sassFun = function(o){
    return gulp.src(root + o.language + o.type + srcRoot + paths.stylesheets + paths.sass + '/**/*.scss', { sourcemaps: true })
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))// compressed - min으로 압축 / 기본으로 사용하려면 그냥 삭제 sass()
        .pipe(sourcemaps.write(paths.map))
        .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.stylesheets + paths.css))
        .pipe(browserSyncPCA.stream());
};
gulp.task('pcA-sass',async function(){sassFun({language : language.ko, type : type.pcA});});


/**
 * SCRIPT USED
 */
var scriptFun = function(o){
    return gulp.src([
        root + o.language + o.type + srcRoot + paths.script + "/function/default.js",
        root + o.language + o.type + srcRoot + paths.script + "/function/*.js"
    ])
        .pipe(concat('design_common.js'))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify()) //난독화 압축 하려면 사용 아니면 삭제
        // .pipe(sourcemaps.write("../map"))
        .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.script));
};
gulp.task('pcA-script',async function(){scriptFun({language: language.ko, type: type.pcA});});

/**
 * SCRIPT API
 */
var pluginFun = function(o){
    return gulp.src([
        root + o.language + o.type + srcRoot + paths.script + "/plugin/*.js"
    ])
        .pipe(concat('plugin.js'))
        .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.script));
};
gulp.task('pcA-plugin',async function(){pluginFun({language: language.ko, type: type.pcA});});

/**
 * images copy
 */
var imagesFun = function(o){
    return gulp.src(root + o.language + o.type + srcRoot + paths.images + "/**/*.{gif,jpg,png,svg}")
        .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.images))
};
gulp.task('pcA-image-copy',async function(){imagesFun({language : language.ko, type : type.pcA});});

/**
 * WACTH
 */
browserSyncPCA = require('browser-sync').create();
gulp.task('pcA-all',async function(){
    browserSyncPCA.init({
        port:2002,
        server: {
            baseDir: typeRoot.distPcA,
            index: "work_list.html"
        },
        ui: false
    });

    watch(typeRoot.srcPcA + paths.stylesheets + '/**/*.scss', gulp.series('pcA-sass'));
    watch(typeRoot.srcPcA + paths.script + "/function/*.js", gulp.series("pcA-script"));
    watch([typeRoot.srcPcA + "/**/**/*.html", typeRoot.srcPcA + "/*.html"], gulp.series('pcA-html-copy'));
    watch(typeRoot.srcPcA + paths.images + "/**/*.{gif,jpg,png,svg}", gulp.series('pcA-image-copy'));

    watch([
        typeRoot.distPcA + paths.stylesheets + '/**/*.css',
        typeRoot.distPcA + "/*.html",
        typeRoot.distPcA + paths.script + "/*.js"
    ]).on('change', browserSyncPCA.reload);
});

/**
 * TASK
 */
gulp.task('default',
    gulp.series(
        'pcA-html-copy',
        'pcA-script',
        'pcA-sass',
        'pcA-image-copy',
        'pcA-plugin',
        'pcA-all'
    )
);
