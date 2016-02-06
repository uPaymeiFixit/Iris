module.exports = {
    database: require('./modules/database').init(),
    webServer: require('./modules/web_server').init(),
    API: require('./modules/API'),
    devAPI: undefined,

    init: function () {
        this.API.init(this.webServer.getApp(), this.database);
        if (process.env.NODE_ENV === 'development') {
            this.devAPI = require('./modules/dev_api').init(this.webServer.getApp(), this.webServer.loadPages);
        }

        return this;
    },
    start: function () {
        // this.database.start();
        this.webServer.start();
        this.API.start();
        if (this.devAPI !== undefined) {
            this.devAPI.start();
        }
    },
    stop: function () {

    }
};

module.exports.init().start();
