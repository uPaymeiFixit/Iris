var gulp = require('gulp');
var exit = require('gulp-exit');
var chalk = require('chalk');
var main;
var bower;
var jshint;
var mocha;
var sass;
var concat;
var spawn = require('child_process').spawn;
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
    return gulp.src(['modules/test/*'], {read: false})
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
    return gulp.src('modules/pages/resources/*/*.scss')
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

gulp.task('scripts', function () {
    if (!concat) {
        concat = require('gulp-concat');
    }
    return gulp.src(['modules/pages/resources/scripts/landing/*.js', 'modules/pages/resources/scripts/locations/*.js', 'modules/pages/resources/scripts/menu/*.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('modules/pages/resources/scripts/dist'));
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

var electron;
gulp.task('electron-start', function () {
    if (electron) {
        electron.stdin.pause();
        electron.kill();
    }
    electron = spawn('electron', ['./electron_start.js']);
    electron.stderr.on('data', function (data) {
        var date = new Date();
        var hours = date.getHours();
        hours = hours < 10 ? '0' + hours : hours;
        var minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var seconds = date.getSeconds();
        seconds = seconds < 10 ? '0' + seconds : seconds;
        process.stdout.write('[' + chalk.gray(hours + ':' + minutes + ':' + seconds) + '] ' + chalk.green('Electron') + ' ' + chalk.red(data));
    });
    electron.stdout.on('data', function (data) {
        var date = new Date();
        var hours = date.getHours();
        hours = hours < 10 ? '0' + hours : hours;
        var minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var seconds = date.getSeconds();
        seconds = seconds < 10 ? '0' + seconds : seconds;
        process.stdout.write('[' + chalk.gray(hours + ':' + minutes + ':' + seconds) + '] ' + chalk.green('Electron') + ' ' + data);
    });
});

gulp.task('watch', function () {
    gulp.watch(['modules/resources/pages/*/*.js'], ['scripts', 'live-reload']);
    gulp.watch(['modules/resources/pages/*/*.scss'], ['sass', 'live-reload']);
    gulp.watch(['modules/resources/pages/*/*.html'], ['reload-pages']);
    gulp.watch(['modules/*.js'], ['run']);
    gulp.watch('main.js', ['run']);
});

gulp.task('default', ['test', 'lint', 'sass', 'scripts']);
gulp.task('build', ['sass', 'scripts']);
gulp.task('run', ['electron-start']);
gulp.task('deploy', ['sass', 'scripts', 'run']);
gulp.task('dev', ['set-dev', 'sass', 'run', 'watch']);
