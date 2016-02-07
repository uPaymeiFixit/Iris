var gulp = require('gulp');
var exit = require('gulp-exit');
var chalk = require('chalk');
var main;
var bower;
var jshint;
var mocha;
var sass;
var autoprefixer;
var concat;
var gls;
var request;
var mode = 'production';

gulp.task('set-dev', function () {
    mode = 'development';
});

gulp.task('bower-install', function () {
    if (!bower) {
        bower = require('gulp-bower');
    }
    return bower();
});

gulp.task('lint', function () {
    if (!jshint) {
        jshint = require('gulp-jshint');
    }
    return gulp.src('*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test', function () {
    if (!mocha) {
        mocha = require('gulp-mocha');
    }
    return gulp.src(['modules/test/*',
                     'modules/pages/resources/scripts/shared/test/*',
                     'modules/pages/resources/scripts/landing/test/*',
                     'modules/pages/resources/scripts/locations/test/*',
                     'modules/pages/resources/scripts/menu/test/*'
                    ], {read: false})
        .pipe(mocha({
            growl: true,
            useColors: true
        }))
        .pipe(exit());
});

gulp.task('sass', function () {
    if (!sass) {
        sass = require('gulp-sass');
    }
    return gulp.src('modules/pages/resources/styles/*.scss')
        .pipe(sass().on('error', function (err) {
            var msg = '';
            var lines = err.messageFormatted.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (i > 0) {
                    msg += chalk.red(lines[i]);
                } else {
                    msg += lines[i];
                }
                if (i + 1 < lines.length) {
                    msg += '\n';
                }
            }
            console.log(msg);
        }))
        .pipe(gulp.dest('modules/pages/resources/styles/dist'));
});

gulp.task('autoprefixer', function () {
    if (!autoprefixer) {
        autoprefixer = require('gulp-autoprefixer');
    }
    return gulp.src('modules/pages/resources/styles/dist/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('modules/pages/resources/styles/dist'));
});

gulp.task('scripts', function () {
    if (!concat) {
        concat = require('gulp-concat');
    }
    // TODO add uglify back in once it works
    // var uglify = require('gulp-uglify');
    // var rename = require('gulp-rename');
    // TODO seperate each view's scripts
    // return gulp.src('pages/resources/scripts/*.js')
    //     .pipe(concat('all.js'))
    //     .pipe(gulp.dest('pages/resources/scripts/dist'))
    //     .pipe(rename('all.min.js'))
    //     .pipe(uglify())
    //     .pipe(gulp.dest('pages/resources/scripts/dist'));
    return gulp.src(['modules/pages/resources/scripts/landing/*.js', 'modules/pages/resources/scripts/locations/*.js', 'modules/pages/resources/scripts/menu/*.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('modules/pages/resources/scripts/dist'));
});

gulp.task('node-server', function () {
    if (!gls) {
        gls = require('gulp-live-server');
    }
    if (main) {
        main.stop();
    }
    main = gls.new('main.js', {env: {NODE_ENV: mode}});
    main.start();
});

gulp.task('reload-pages', function () {
    if (!request) {
        request = require('request');
    }
    request.post('http://localhost:8080/dev_api/reload_pages');
});

gulp.task('live-reload', function (file) {
    // console.log('live-reloading ' + file);
    if (main) {
        main.notify.apply(main, [file]);
        // console.log('live-reloading');
    }
    // console.log('live-reload done');
    // return gulp.src(file).pipe(exit());
});

gulp.task('watch', function () {
    gulp.watch(['modules/pages/resources/scripts/landing/*.js',
                'modules/pages/resources/scripts/locations/*.js',
                'modules/pages/resources/scripts/menu/*.js',
                'modules/pages/resources/scripts/common/*.js'
            ], ['scripts', 'live-reload']);
    gulp.watch('modules/pages/resources/styles/*.scss', ['sass', 'live-reload']);
    gulp.watch('modules/pages/*.html', ['reload-pages']);
    // gulp.watch('modules/pages/parts/*/*.html', ['node-server']);
    gulp.watch('main.js', ['node-server']);
    gulp.watch('modules/*.js', ['node-server']);
});

gulp.task('default', ['test', 'lint', 'sass', 'scripts']);
gulp.task('build', ['sass', 'scripts']);
gulp.task('run', ['node-server']);
gulp.task('deploy', ['sass', 'scripts', 'run']);
gulp.task('dev', ['set-dev', 'sass', 'scripts', 'run', 'watch']);
