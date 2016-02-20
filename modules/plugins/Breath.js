var value = 0;

var maxRGB = 255;
var minRGB = 10;
var RGBrange = (maxRGB - minRGB);

var vertTranslate = (RGBrange / 2) + minRGB;

module.exports = function (iris) {
    return {
        name: 'Breath',
        update: function (timeMultiplier) {
            if (value >= Math.PI * 2) {
                value = 0;
            }
            var lightness = Math.cos(lightness) / -2 * RGBrange + vertTranslate;
            for (var i = 0; i < iris.leds.length; i++) {
                iris.leds[i] = [lightness, lightness, lightness];
            }
            value += 0.01 * timeMultiplier;
        }
    };
};
