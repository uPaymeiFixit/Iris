var fs = require('fs');

module.exports = {

    init: function () {
        this.reloadPlugins();

        return this;
    },
    start: function () {

    },
    stop: function () {

    },
    reloadPlugins: function () {
        fs.access('~/Application Support/Iris/plugins/', function (err) {
            if (!err) {
                fs.readdirSync('~/Application Support/Iris/plugins/', function (err, files) {
                    console.log(err);
                    console.log(files);
                });
            }
        });
    }
};
