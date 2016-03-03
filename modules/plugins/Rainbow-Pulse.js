var lightness = 0;
var hue = Math.random();

var maxRGB = 255;
var minRGB = 10;
var RGBrange = (maxRGB - minRGB);

var vertTranslate = (RGBrange / 2) + minRGB;

module.exports = function () {
    return {
        name: 'Rainbow Pulse',
        update: function (leds, timeMultiplier) {
            if (lightness >= Math.PI * 2) {
                lightness = 0;
                hue = Math.random();
            }
            for (var i = 0; i < leds.length; i++) {
                leds[i] = [hue, 1, (Math.cos(lightness) / -2 * RGBrange + vertTranslate) / 255];
            }
            lightness += 0.01 * timeMultiplier;
        }
    };
};
