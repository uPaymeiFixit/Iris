var async = require('async');

module.exports = {
    serial: require('./modules/serial'),
    plugins: require('./modules/plugins'),
    devAPI: undefined,

    init: function (callback) {
        async.parallel([
            function (callback) {
                module.exports.serial.init(callback);
            },
            function (callback) {
                module.exports.plugins.init(module.exports.serial, callback);
            }
        ], function () {
            if (callback) {
                callback();
            }
            // module.exports.start();
        });
        if (process.env.NODE_ENV === 'development') {

        }

        return this;
    },
    start: function (callback) {
        console.log('Starting the main server…');
        async.parallel([
            function (callback) {
                module.exports.serial.start(callback);
            },
            function (callback) {
                module.exports.plugins.start(callback);
            }
        ], function () {
            module.exports.plugins.activatePlugin('Rainbow Loop');
            module.exports.plugins.activatePlugin('Breath');
            if (callback) {
                callback();
            }
            // module.exports.start();
        });
    },
    stop: function (exitCode, callback) {
        console.log('Stopping the main server…');
        module.exports.plugins.stop();
        module.exports.serial.stop();
        if (callback) {
            callback();
        }
        if (exitCode !== undefined) {
            console.log('exitting: ' + exitCode);
            process.exit(exitCode);
        }
    }
};
