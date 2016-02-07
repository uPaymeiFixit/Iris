var async = require('async');

module.exports = {
    serial: require('./modules/serial'),
    plugins: require('./modules/plugins'),
    devAPI: undefined,

    init: function () {
        async.parallel([
            function (callback) {
                module.exports.serial.init(callback);
            },
            function (callback) {
                module.exports.plugins.init(module.exports.serial, callback);
            }
        ], function () {
            module.exports.start();
        });
        if (process.env.NODE_ENV === 'development') {

        }

        return this;
    },
    start: function () {
        console.log('Starting the main server...');
        this.serial.start();
        this.plugins.start();
        this.plugins.activatePlugin('Pulse');
    },
    stop: function () {
        console.log('Stopping the main server...');
        this.plugins.stop();
        this.serial.stop();
    }
};
