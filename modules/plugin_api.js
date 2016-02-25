var storage = require('electron-json-storage');

module.exports = {
    leds: [],
    convert: {
        RGBtoHSV: function (r, g, b) {
            if (r[0]) {
                b = r[2];
                g = r[1];
                r = r[0];
            }

            var computedH = 0;
            var computedS = 0;
            var computedV = 0;

            // remove spaces from input RGB values, convert to int
            r = parseInt(('' + r).replace(/\s/g, ''), 10);
            g = parseInt(('' + g).replace(/\s/g, ''), 10);
            b = parseInt(('' + b).replace(/\s/g, ''), 10);

            if (r === null || g === null || b === null || isNaN(r) || isNaN(g) || isNaN(b)) {
                console.log('Please enter numeric RGB values!');
                console.log(typeof r + ', ' + typeof g + ', ' + typeof b);
                console.log(r + ', ' + g + ', ' + b);
                return [0, 0, 0];
            }
            if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) {
                console.log('RGB values must be in the range 0 to 255.');
                return [0, 0, 0];
            }
            r = r / 255;
            g = g / 255;
            b = b / 255;
            var minRGB = Math.min(r, Math.min(g, b));
            var maxRGB = Math.max(r, Math.max(g, b));

            // Black-gray-white
            if (minRGB === maxRGB) {
                computedV = minRGB;
                return [0,0,computedV];
            }

            // Colors other than black-gray-white:
            var d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
            var h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
            computedH = 60 * (h - d / (maxRGB - minRGB));
            computedS = (maxRGB - minRGB) / maxRGB;
            computedV = maxRGB;
            return [computedH / 360, computedS, computedV];
        },
        HSVtoRGB: function (h, s, v) {
            if (h[0]) {
                v = h[2];
                s = h[1];
                h = h[0];
            }

            var r;
            var g;
            var b;
            var i;
            var f;
            var p;
            var q;
            var t;

            if (arguments.length === 1) {
                h = h.h;
                s = h.s;
                v = h.v;
            }
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                break;
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
    },
    storage: {
        get: function (plug, key, callback) {
            storage.get(plug + '.' + key, function (data) {
                callback(data);
            });
        },
        set: function (plug, key, val, callback) {
            storage.set(plug + '.' + key, val, function (error) {
                callback(error);
            });
        },
        has: function (plug, key, callback) {
            storage.has(plug + '.' + key, function (error, data) {
                callback(error, data);
            });
        },
        remove: function (plug, key, callback) {
            storage.remove(plug + '.' + key, function (error) {
                callback(error);
            });
        }
    }
};
