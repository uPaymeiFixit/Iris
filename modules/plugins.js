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
        console.log('Initializing plugins…');
        serial = _serial;
        var NUM_LEDS = 17;
        irisAPI.leds = [];
        irisAPI.leds[NUM_LEDS - 1] = undefined;
        for (var i = 0; i < irisAPI.leds.length; i++) {
            irisAPI.leds[i] = [0, 0, 0];
        }

        this.reloadPluginsSync(function () {
            if (callback) {
                callback();
            }
        });

        return this;
    },
    start: function (callback) {
        console.log('Starting plugins…');
        this.pluginClock = setInterval(function () {
            for (var i in module.exports.activatedPlugins) {
                if (module.exports.loadedPlugins[module.exports.activatedPlugins[i]].update) {
                    // TODO: set timeMultiplier to a percentage of the time elapsed compared to 1000/30ms
                    var timeMultiplier = module.exports.refreshRate / (1000 / 30);
                    module.exports.loadedPlugins[module.exports.activatedPlugins[i]].update(timeMultiplier);
                }
            }
            serial.write(irisAPI.leds);
        }, this.refreshRate);
        if (callback) {
            callback();
        }
    },
    stop: function (callback) {
        clearInterval(this.pluginClock);
        if (callback) {
            callback();
        }
    },
    reloadPlugins: function (callback) {
        module.exports.activatedPlugins = [];
        console.log('Loading plugins…');
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
    reloadPluginsSync: function (callback) {
        module.exports.activatedPlugins = [];
        console.log('Loading plugins…');
        function loadPlugins (folder) {
            if (folder === undefined) {
                folder = module.exports.pluginsFolder;
            }
            // TODO: if there are no plugins to load, then 'it never finishes' loading them
            var files = fs.readdirSync(folder);
            for (var file in files) {
                var stats = fs.statSync(folder + files[file]);
                if (stats.isFile()) {
                    // TODO: make this more efficient. Maybe just catching an error on a bad require would do it
                    if (files[file].split('.').reverse()[0].toLowerCase() === 'js') {
                        var plugin = require(folder + files[file])(irisAPI);
                        module.exports.loadedPlugins[plugin.name] = plugin;
                        console.log('  ' + plugin.name);
                    }
                } else if (stats.isDirectory()) {
                    loadPlugins(folder + files[file] + '/');
                }
            }
        }

        if (!fs.accessSync(module.exports.pluginsFolder)) {
            loadPlugins();
        } else {
            console.log('Could\'t find plugins folder');
            fs.mkdirpSync(module.exports.pluginsFolder);
            console.log('Created plugins folder at ' + module.exports.pluginsFolder);
            loadPlugins();
        }

        if (callback) {
            callback();
        }
    },
    activatePlugin: function (plugin) {
        if (this.activatedPlugins.indexOf(plugin) === -1) {
            if (this.loadedPlugins[plugin] !== undefined) {
                this.activatedPlugins.push(plugin);
                console.log('Loaded ' + plugin + ' plugin');
            } else {
                console.log('Plugin not found');
            }
        } else {
            console.log('Plugin already activated');
        }
    },
    deactivatePlugin: function (plugin) {
        if (this.activatedPlugins.indexOf(plugin) !== -1) {
            this.activatedPlugins.splice(this.activatedPlugins.indexOf(plugin), 1);
        }
    }
};
