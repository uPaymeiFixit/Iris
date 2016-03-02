var electron = require('electron');
var os = require('os');
var notifier = require('node-notifier');

var main;
var tray;
var trayMenu = [
    {label: 'Plugins', submenu: [
        {label: 'Open Plugins Folder…', click: function () {
            switch (process.platform) {
                case 'darwin':
                    require('child_process').spawn('open', [os.homedir() + '/Library/Application\ Support/Iris/plugins']);
                    break;
                case 'linux':
                    require('child_process').spawn('open', [os.homedir() + '/Application\ Data/Iris/plugins']);
                    break;
                case 'win32':
                    require('child_process').spawn('explorer', [os.homedir() + '/"Application Data"/Local/Iris/plugins']);
                    break;
            }
        }},
        {label: 'Reload Plugins', click: function () {
            module.exports.clearPlugins();
            main.plugins.reloadPluginsSync(function () {

            });
        }},
        {type: 'separator'},
        {label: 'Modifiers', submenu: []}
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
];

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

            var image = electron.nativeImage.createFromPath(process.cwd() + '/modules/resources/images/IconTemplate.png');
            tray = new electron.Tray(image);

            tray.setContextMenu(electron.Menu.buildFromTemplate(trayMenu));
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
        var splitName = name.split('/');

        if (splitName.length > 1) {
            // TODO: push to the right submenu
            // var folder = splitName[0];

            trayMenu[0].submenu[3].submenu.push({
                label: splitName[splitName.length - 1],
                type: 'checkbox',
                click: function (menuItem) {
                    if (menuItem.checked) {
                        main.plugins.activatePlugin(name);
                    } else {
                        main.plugins.deactivatePlugin(name);
                    }
                }
            });
        } else {
            trayMenu[0].submenu.push({
                label: name,
                type: 'radio',
                click: function () {
                    main.plugins.deactivateBasePlugins();
                    main.plugins.activatePlugin(name);
                }
            });
        }

        if (tray) {
            tray.setContextMenu(electron.Menu.buildFromTemplate(trayMenu));
        }
    },
    clearPlugins: function () {
        trayMenu[0].submenu[3].submenu = [];
        trayMenu[0].submenu.splice(4, trayMenu[0].submenu.length - 4);

        if (tray) {
            tray.setContextMenu(electron.Menu.buildFromTemplate(trayMenu));
        }
    },
    checkPlugin: function (name, submenu) {
        if (!submenu) {
            submenu = trayMenu[0].submenu;
        }

        var splitName = name.split('/');
        if (splitName.length > 1) {
            var submenuName = splitName[0];

            for (var i = 0; i < submenu.length; i++) {
                if (submenu[i].submenu && submenu[i].label === submenuName) {
                    splitName.splice(0, 1);
                    module.exports.checkPlugin(splitName.join('/'), submenu[i].submenu);
                }
            }
        } else {
            for (var i = 0; i < submenu.length; i++) {
                if (submenu[i].label === name) {
                    submenu[i].checked = true;

                    if (tray) {
                        tray.setContextMenu(electron.Menu.buildFromTemplate(trayMenu));
                    }
                    return;
                }
            }
        }
    }
};
