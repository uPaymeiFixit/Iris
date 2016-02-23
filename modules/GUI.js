var electron = require('electron');
var notifier = require('node-notifier');

var tray;
var trayMenu;
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
            module.exports.app.dock.hide();

            var image = electron.nativeImage.createFromPath(process.cwd() + '/modules/resources/images/icon.png');
            tray = new electron.Tray(image);

            trayMenu = electron.Menu.buildFromTemplate([
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
                    {label: 'Set LED Count', click: function () {
                        module.exports.dialog('dialog', 'Set LED Count', 'Set LED Count', function (response) {
                            console.log('New LED count: ' + response);
                        });
                    }},
                    {label: 'Set Baud Rate', click: function () {
                        module.exports.dialog('notification', 'Set Baud Rate', 'Set Baud Rate', function (response) {
                            console.log('New LED count: ' + response);
                        });
                    }}
                ]},
                {type: 'separator'},
                {label: 'Quit', click: function () {main.stop(0);}}
            ]);

            tray.setContextMenu(trayMenu);
        });

        if (callback) {
            callback();
        }
    },
    stop: function (callback) {
        if (callback) {
            callback();
        }
    },
    dialog: function (type, title, message, callback) {
        var response = '';

        switch (type) {
            case 'dialog':
                var win = new electron.BrowserWindow({
                    width: 500,
                    height: 300,
                    show: false,
                    title: title,
                    icon: electron.nativeImage.createFromPath(process.cwd() + '/modules/resources/images/icon.png')
                });
                win.on('closed', function () {
                    if (callback) {
                        callback(response);
                    }
                });
                win.loadURL('file://' + process.cwd() + '/modules/resources/pages/dialog/dialog.html');
                win.show();
                break;
            case 'notification':
                notifier.notify({
                    title: title,
                    message: message,
                    icon: process.cwd() + '/modules/resources/images/icon.png'
                }, function (err, res) {
                    response = res;
                    if (callback) {
                        callback(res);
                    }
                });
                break;
            case 'alert':
                electron.dialog.showMessageBox({type: 'error', buttons: ['OK'], title: title, message: message}, function () {
                    response = 'error seen';
                    if (callback) {
                        callback(response);
                    }
                });
                break;
        }
    },
    addPlugin: function (name) {
        trayMenu[0].push(name);
    },
    clearPlugins: function () {
        tray.
    }
};
