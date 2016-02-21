var electron = require('electron');

var mainWindow;
var appIcon;
var main;

module.exports = {
    app: electron.app,

    init: function (_main,  callback) {
        main = _main;
        if (callback) {
            callback();
        }
    },
    start: function (callback) {
        module.exports.app.on('ready', function () {
            appIcon = new electron.Tray(process.cwd() + '/modules/resources/images/icon.gif');

            var menu = electron.Menu.buildFromTemplate([
                {label: 'Plugins', submenu: []},
                {type: 'separator'},
                {label: 'Settings', submenu: []},
                {type: 'separator'},
                {label: 'Quit', click: function () {main.stop(0);}}
            ]);

            appIcon.setContextMenu(menu);
        });

        if (callback) {
            callback();
        }
    },
    stop: function (callback) {
        if (callback) {
            callback();
        }
    }
};
