var async = require('async');
var storage = require('electron-json-storage');

module.exports = {
    serial: require('./modules/serial'),
    plugins: require('./modules/plugins'),
    GUI: undefined,
    devAPI: undefined,

    init: function (GUI, callback) {
        module.exports.GUI = GUI;
        async.parallel([
            function (callback) {
                module.exports.serial.init(callback);
            },
            function (callback) {
                module.exports.plugins.init(module.exports.serial, module.exports.GUI, callback);
            }
        ], function () {
            if (callback) {
                callback();
            }
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
            storage.get('activatedPlugins').then(function (activatedPlugins) {
                for (var i in activatedPlugins) {
                    module.exports.plugins.activatePlugin(activatedPlugins[i]);
                    module.exports.GUI.checkPlugin(activatedPlugins[i]);
                }
            });
            if (callback) {
                callback();
            }
        });
    },
    stop: function (exitCode, callback) {
        console.log('Stopping the main server…');
        module.exports.plugins.stop();
        module.exports.serial.stop();

        storage.set('activatedPlugins', module.exports.plugins.activatedPlugins);

        if (callback) {
            callback();
        }
        if (exitCode !== undefined) {
            console.log('exitting: ' + exitCode);
            process.exit(exitCode);
        }
    }
};
