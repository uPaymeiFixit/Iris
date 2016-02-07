var fs = require('fs');
var mkdirp = require('mkdirp');
var os = require('os');

var irisAPI = require('./plugin_api');

module.exports = {
    pluginsFolder: os.homedir() + '/Library/Application Support/Iris/plugins/',
    loadedPlugins: [],
    activatedPlugins: [],
    pluginClock: undefined,
    refreshRate: 1000 / 30,

    init: function () {
        this.reloadPlugins();

        return this;
    },
    start: function () {
        console.log('starting plugins');
        this.pluginClock = setInterval(function () {
            for (var i in module.exports.activatedPlugins) {
                if (module.exports.loadedPlugins[module.exports.activatedPlugins[i]].update) {
                    module.exports.loadedPlugins[module.exports.activatedPlugins[i]].update();
                }
            }
        }, this.refreshRate);
    },
    stop: function () {
        clearInterval(this.pluginClock);
    },
    reloadPlugins: function () {
        console.log('Loading Plugins');
        function loadPlugins (folder) {
            if (folder === undefined) {
                folder = module.exports.pluginsFolder;
            }
            fs.readdir(folder, function (err, files) {
                for (var file in files) {
                    (function (_file) {
                        fs.stat(folder + files[_file], function (err, stats) {
                            if (stats.isFile()) {
                                // TODO: make this more efficient. Maybe just catching an error on a bad require would do it
                                if (files[_file].split('.').reverse()[0].toLowerCase() === 'js') {
                                    var plugin = require(folder + files[_file])(irisAPI);
                                    module.exports.loadedPlugins[plugin.name] = plugin;
                                    console.log('  ' + plugin.name);
                                }
                            } else if (stats.isDirectory()) {
                                loadPlugins(folder + files[_file] + '/');
                            }
                        });
                    })(file);
                }
            });
        }

        fs.access(module.exports.pluginsFolder, function (err) {
            if (!err) {
                loadPlugins();
            } else {
                console.log('Could\'t find plugins folder');
                mkdirp(module.exports.pluginsFolder, function () {
                    console.log('Created plugins folder at ' + module.exports.pluginsFolder);
                    loadPlugins();
                });
            }
        });
    },
    activatePlugin: function (plugin) {
        if (this.activatedPlugins.indexOf(plugin) === -1) {
            this.activatedPlugins.push(plugin);
        }
    },
    deactivatePlugin: function (plugin) {
        if (this.activatedPlugins.indexOf(plugin) !== -1) {
            this.activatedPlugins.splice(this.activatedPlugins.indexOf(plugin), 1);
        }
    }
};
