module.exports = {
    serial: require('./modules/serial'),
    devAPI: undefined,

    init: function () {
        this.serial.init();
        if (process.env.NODE_ENV === 'development') {

        }

        return this;
    },
    start: function () {
        this.serial.start();
    },
    stop: function () {

    }
};

module.exports.init().start();
