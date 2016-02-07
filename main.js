module.exports = {
    serial: require('./modules/serial'),
    plugins: require('./modules/plugins'),
    devAPI: undefined,

    init: function () {
        this.serial.init();
        this.plugins.init();
        if (process.env.NODE_ENV === 'development') {

        }

        return this;
    },
    start: function () {
        this.serial.start();
    },
    stop: function () {
        this.serial.stop();
    }
};
