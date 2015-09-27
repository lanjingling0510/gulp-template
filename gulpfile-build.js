/*========================================
 =            Requiring stuffs            =
 ========================================*/


var gulp = require('gulp'),
    seq = require('run-sequence'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-cssmin'),
    concat = require('gulp-concat'),
    del = require('del'),
    templateCache = require('gulp-angular-templatecache'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngFilesort = require('gulp-angular-filesort'),
    streamqueue = require('streamqueue'),
    path = require('path'),
    cache = require('gulp-cache'),
    notify = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    replace = require('gulp-replace'),
    babel = require('gulp-babel');


/*=====================================
 =        Default Configuration        =
 =====================================*/

var config = {
    root: 'www',
    vendor: {
        fonts: [],
        css: [],
        js: [
            './src/js/jquery.min.js',
            './src/js/velocity.min.js'
        ]
    },

    server: {
        host: '0.0.0.0',
        port: '8000'
    }

};

/*======================================
 =            Build Sequence            =
 ======================================*/

gulp.task('build', function (done) {
    var tasks = ['fonts', 'less', 'js', 'html'];
    seq('clean', tasks, done);
});


/*==========================================
 =            Start a web server            =
 ==========================================*/

gulp.task('connect', function () {
    if (typeof config.server === 'object') {
        connect.server({
            root: config.root,
            host: config.server.host,
            port: config.server.port,
            livereload: true
        });
    } else {
        throw new Error('Connect is not configured');
    }
});


/*==============================================================
 =            Setup live reloading on source changes            =
 ==============================================================*/

gulp.task('livereload', function () {
    gulp.src(path.join(config.root, '*.html'))
        .pipe(livereload());
});


/*==================================
 =            Copy fonts            =
 ==================================*/


gulp.task('fonts', function () {
    gulp.src(config.vendor.fonts)
        .pipe(gulp.dest(path.join(config.root, 'fonts')))
        .pipe(notify({message: 'fonts complete ...'}));
});


/*=================================================
 =            Copy html files to dest              =
 =================================================*/

gulp.task('html', function () {
    gulp.src(['src/*.html'])
        .pipe(gulp.dest(config.root))
        .pipe(notify({message: 'html complete ...'}));
});


/*======================================================================
 =            Compile, minify less                            =
 ======================================================================*/


gulp.task('less', function () {
    streamqueue({objectMode: true},
        gulp.src(config.vendor.css),
        gulp.src(['./src/css/*.less']).pipe(less())
    )
        .pipe(autoprefixer(
            'ie >= 8',
            'ie_mob >= 10',
            'ff >= 30',
            'chrome >= 34',
            'safari >= 7',
            'opera >= 23',
            'ios >= 7',
            'android >= 2.3',
            'bb >= 10'
        ))
        .pipe(cssmin())
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(path.join(config.root)))
        .pipe(notify({message: 'less complete ...'}));
});


/*====================================================================
 =            Compile and minify js generating source maps            =
 ====================================================================*/


gulp.task('js', function () {
    streamqueue({objectMode: true},
        gulp.src(config.vendor.js),
        gulp.src('./src/js/app.js').pipe(babel())
    )
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        //.pipe(ngAnnotate())
        //.pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.join(config.root)))
        .pipe(notify({message: 'js complete ...'}));
});


/*=========================================
 =            Clean dest folder            =
 =========================================*/

gulp.task('clean', function () {
    del(['www/*.js', 'www/*.css', 'www/fonts/*']);
});


/*================================================
 =            Report Errors to Console            =
 ================================================*/

gulp.on('error', function (e) {
    throw(e);
});


/*===================================================================
 =            Watch for source changes and rebuild/reload            =
 ===================================================================*/

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(['./src/font/**/*'], ['fonts']);
    gulp.watch(['./src/*.html'], ['html']);
    gulp.watch(['./src/css/**/*'], ['less']);
    gulp.watch(['./src/js/**/*'], ['js']);
    if (typeof config.server === 'object') {
        gulp.watch([config.root + '/**/*'], ['livereload']);
    }
});

/*====================================
 =            Default Task            =
 ====================================*/

gulp.task('default', function (done) {
    var tasks = [];
    if (typeof config.server === 'object') {
        tasks.push('connect');
    }
    tasks.push('watch');
    seq('build', tasks, done);
});
