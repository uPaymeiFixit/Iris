var fs = require('fs.extra');
var os = require('os');

var irisAPI = require('./plugin_api');
var serial;

module.exports = {
    pluginsFolder: os.homedir() + '/Library/Application Support/Iris/plugins/',
    loadedPlugins: [],
    activatedPlugins: [],
    pluginClock: undefined,
    refreshRate: 1000 / 30,

    init: function (_serial, callback) {
        serial = _serial;
        // irisAPI.leds = serial.getLEDs();
        var NUM_LEDS = 17;
        irisAPI.leds = new Uint8Array(NUM_LEDS * 3);

        this.reloadPlugins(function () {
            if (callback) {
                callback();
            }
        });

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
            serial.write(irisAPI.leds);
        }, this.refreshRate);
    },
    stop: function () {
        clearInterval(this.pluginClock);
    },
    reloadPlugins: function (callback) {
        console.log('Loading Plugins');
        var pluginsToLoad = 0;
        var pluginsLoaded = 0;
        function loadPlugins (folder) {
            if (folder === undefined) {
                folder = module.exports.pluginsFolder;
            }
            // TODO: if there are no plugins to load, then 'it never finishes' loading them
            fs.readdir(folder, function (err, files) {
                pluginsToLoad += files.length;
                for (var file in files) {
                    (function (_file) {
                        fs.stat(folder + files[_file], function (err, stats) {
                            if (stats.isFile()) {
                                // TODO: make this more efficient. Maybe just catching an error on a bad require would do it
                                if (files[_file].split('.').reverse()[0].toLowerCase() === 'js') {
                                    var plugin = require(folder + files[_file])(irisAPI);
                                    module.exports.loadedPlugins[plugin.name] = plugin;
                                    pluginsLoaded++;
                                    console.log('  ' + plugin.name);
                                    if (pluginsLoaded >= pluginsToLoad) {
                                        if (callback) {
                                            callback();
                                        }
                                    }
                                } else {
                                    pluginsToLoad--;
                                }
                            } else if (stats.isDirectory()) {
                                pluginsToLoad--;
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
                fs.mkdirp(module.exports.pluginsFolder, function () {
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
