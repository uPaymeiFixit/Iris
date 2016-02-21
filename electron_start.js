var main = require('./main');
var GUI = require('./modules/GUI');

module.exports = {
    init: function (callback) {
        main.init();
        GUI.init(main);

        if (callback) {
            callback();
        }
    },
    start: function (callback) {
        main.start();
        GUI.start();

        if (callback) {
            callback();
        }
    },
    stop: function (callback) {
        main.stop();
        GUI.stop();

        if (callback) {
            callback();
        }
    }
};

module.exports.init(function () {
    module.exports.start();
});
