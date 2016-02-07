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
        console.log('Starting the main server...');
        this.serial.start();
        this.plugins.start();
    },
    stop: function () {
        console.log('Stopping the main server...');
        this.plugins.stop();
        this.serial.stop();
    }
};
