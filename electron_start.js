var main = require('./main');
var GUI = require('./modules/GUI');

module.exports = {
    init: function (callback) {
        GUI.init(main, function () {
            main.init(GUI, function () {
                if (callback) {
                    callback();
                }
            });
        });
    },
    start: function (callback) {
        GUI.start(function () {
            main.start(function () {
                if (callback) {
                    callback();
                }
            });
        });
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
