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
                {label: 'Plugins', submenu: [
                    {label: 'Open Plugins Folder…', click: function () {
                        var command = '';

                        switch (process.platform) {
                            case 'darwin':
                                command = 'open ~/Library/Application\ Support/Iris/plugins';
                                break;
                            case 'linux':
                                command = 'open ~/Application\ Data/Iris/plugins';
                                break;
                            case 'win32':
                                command = 'open ~/"Application Data"/Local/Iris/plugins';
                                break;
                        }

                        require('child_process').exec(command);
                    }},
                    {label: 'Reload Plugins', click: function () {main.plugins.reloadPlugins();}},
                    {type: 'separator'}
                ]},
                {type: 'separator'},
                {label: 'Settings', submenu: [
                    {label: 'Set LED Count', click: function () {}},
                    {label: 'Set Baud Rate', click: function () {}}
                ]},
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
