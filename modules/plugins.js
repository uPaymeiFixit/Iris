var fs = require('fs.extra');
var os = require('os');

var irisAPI = require('./plugin_api');
var serial;
var GUI;

var RGBtoHSV = function (leds) {
    var converted = [];
    for (var i = 0; i < leds.length; i++) {
        converted.push(irisAPI.convert.RGBtoHSV(leds[i][0], leds[i][1], leds[i][2]));
    }
    return converted;
};

var HSVtoRGB = function (leds) {
    var converted = [];
    for (var i = 0; i < leds.length; i++) {
        converted.push(irisAPI.convert.HSVtoRGB(leds[i][0], leds[i][1], leds[i][2]));
    }
    return converted;
};

module.exports = {
    pluginsFolder: os.homedir() + '/Library/Application Support/Iris/plugins/',
    loadedPlugins: [],
    activatedPlugins: [],
    pluginClock: undefined,
    refreshRate: 1000 / 30,
    baseRefreshRate: 1000 / 30,

    init: function (_serial, _gui, callback) {
        console.log('Initializing plugins…');
        serial = _serial;
        GUI = _gui;
        var NUM_LEDS = 17;
        irisAPI.leds = [];
        irisAPI.leds[NUM_LEDS - 1] = undefined;
        for (var i = 0; i < irisAPI.leds.length; i++) {
            irisAPI.leds[i] = [0, 0, 0];
        }

        if (callback) {
            callback();
        }
        return this;
    },
    start: function (callback) {
        console.log('Starting plugins…');

        this.reloadPluginsSync(function () {

        });

        this.pluginClock = setInterval(function () {
            for (var i in module.exports.activatedPlugins) {
                if (module.exports.loadedPlugins[module.exports.activatedPlugins[i]].update) {
                    // TODO: set timeMultiplier to a percentage of the time elapsed compared to 1000/30ms
                    var timeMultiplier = module.exports.refreshRate / module.exports.baseRefreshRate;
                    var leds;
                    if (module.exports.loadedPlugins[module.exports.activatedPlugins[i]].colorSpace === 'RGB' || module.exports.loadedPlugins[module.exports.activatedPlugins[i]].colorSpace === undefined) {
                        leds = RGBtoHSV(module.exports.loadedPlugins[module.exports.activatedPlugins[i]].update(HSVtoRGB(irisAPI.leds), timeMultiplier));
                    } else if (module.exports.loadedPlugins[module.exports.activatedPlugins[i]].colorSpace === 'HSV') {
                        leds = module.exports.loadedPlugins[module.exports.activatedPlugins[i]].update(irisAPI.leds, timeMultiplier);
                    }
                    if (leds) {
                        irisAPI.leds = leds;
                    }
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
        var activatedPlugins = module.exports.activatedPlugins;
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
                                    GUI.addPlugin(plugin.name);
                                    pluginsLoaded++;
                                    console.log('  ' + plugin.name);
                                    if (pluginsLoaded >= pluginsToLoad) {
                                        module.exports.activatedPlugins = activatedPlugins;

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
        module.exports.deactivatePlugins();
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
                        GUI.addPlugin(plugin.name);
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
                if (module.exports.loadedPlugins[plugin].start) {
                    var leds;
                    if (module.exports.loadedPlugins[plugin].colorSpace === 'RGB' || module.exports.loadedPlugins[plugin].colorSpace === undefined) {
                        leds = RGBtoHSV(module.exports.loadedPlugins[plugin].start(HSVtoRGB(irisAPI.leds)));
                    } else if (module.exports.loadedPlugins[plugin].colorSpace === 'HSV') {
                        leds = module.exports.loadedPlugins[plugin].start(irisAPI.leds);
                    }
                    if (leds) {
                        irisAPI.leds = leds;
                    }
                }
                console.log('Loaded ' + plugin + ' plugin');
            } else {
                console.log('Plugin not found');
            }
        } else {
            console.log('Plugin already loaded');
        }
    },
    deactivatePlugin: function (plugin) {
        if (this.activatedPlugins.indexOf(plugin) !== -1) {
            this.activatedPlugins.splice(this.activatedPlugins.indexOf(plugin), 1);
            console.log('Unloaded ' + plugin + ' plugin');
            return;
        }
        console.log('Plugin not loaded');
    },
    deactivatePlugins: function () {
        this.activatedPlugins.splice(0, this.activatedPlugins.length - 1);
    },
    deactivateBasePlugins: function () {
        for (var i in this.activatedPlugins) {
            if (this.activatedPlugins[i].split('/').length < 2) {
                this.activatedPlugins.splice(i, 1);
            }
        }
        console.log('Unloaded all base plugins');
    }
};
