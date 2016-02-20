var lightness = 0;
var hue = Math.random();

var maxRGB = 255;
var minRGB = 10;
var RGBrange = (maxRGB - minRGB);

var vertTranslate = (RGBrange / 2) + minRGB;

module.exports = function (iris) {
    return {
        name: 'Pulse',
        update: function (timeMultiplier) {
            if (lightness >= Math.PI * 2) {
                lightness = 0;
                hue = Math.random();
            }
            var color = iris.HSVtoRGB(hue, 1, (Math.cos(lightness) / -2 * RGBrange + vertTranslate) / 255);
            for (var i = 0; i < iris.leds.length; i++) {
                iris.leds[i] = color;
            }
            lightness += 0.01 * timeMultiplier;
        }
    };
};
