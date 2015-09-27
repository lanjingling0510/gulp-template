/*========================================
 =            Requiring stuffs            =
 ========================================*/


var gulp = require('gulp'),
    replace = require('gulp-replace'),
    seq = require('run-sequence'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    weinre = require('gulp-weinre'),
    path = require('path');

/*=====================================
 =        Default Configuration        =
 =====================================*/

var config = {
    root: 'www',
    server: {
        host: '0.0.0.0',
        port: '8080'
    },
    weinre: {
         httpPort:     8001,
        boundHost:    '192.168.1.106',
        verbose:      false,
        debug:        false,
        readTimeout:  5,
        deathTimeout: 15
  }

};


/*=================================================
=            Copy html files to root            =
=================================================*/

gulp.task('html', function() {
  var inject = [];
  if (typeof config.weinre === 'object') {
    inject.push('<script src="http://'+config.weinre.boundHost+':'+config.weinre.httpPort+'/target/target-script-min.js#anonymous"></script>');
  }
  if (config.cordova) {
    inject.push('<script src="cordova.js"></script>');
  }
  gulp.src(['www/**/*.html'])
  .pipe(replace('<!-- inject:js -->', inject.join('\n    ')))
  .pipe(gulp.dest(config.root));
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


/*===================================================
=            Starts a Weinre Server                 =
===================================================*/

gulp.task('weinre', function() {
  if (typeof config.weinre === 'object') {
    weinre(config.weinre);
  } else {
    throw new Error('Weinre is not configured');
  }
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
    if (typeof config.weinre === 'object') {
        tasks.push('weinre');
    }
    tasks.push('watch');
    seq('html', tasks, done);
});
