var electron = require('electron');

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
            var image = electron.nativeImage.createFromPath(process.cwd() + '/modules/resources/images/icon.png');
            appIcon = new electron.Tray(image);

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
                    {label: 'Set LED Count', click: function () {
                        module.exports.alert('dialog', 'Set LED Count', 'Set LED Count', function (response) {
                            console.log('New LED count: ' + response);
                        });
                    }},
                    {label: 'Set Baud Rate', click: function () {
                        module.exports.alert('notification', 'Set Baud Rate', 'Set Baud Rate', function (response) {
                            console.log('New LED count: ' + response);
                        });
                    }}
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
    },
    alert: function (type, title, message, callback) {
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
                // win.loadURL('https://github.com');
                win.show();
                break;
            case 'notification':
                var win = new electron.BrowserWindow({
                    width: 0,
                    height: 0,
                    show: false
                });
                // win.loadURL('https://github.com');
                win.show();

                var notification = new electron.Notification(title, {
                    body: message
                });

                notification.onclick = function () {
                    response = 'notification clicked';
                    if (callback) {
                        callback(response);
                    }
                };
                notification.onclose = function () {
                    response = 'notification closed';
                    if (callback) {
                        callback(response);
                    }
                };
                break;
        }
    }
};
