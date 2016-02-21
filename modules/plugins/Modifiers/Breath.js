var value = 0;

var max = 1;
var min = 0.039;
var range = (max - min);

var vertTranslate = (range / 2) + min;

module.exports = function (iris) {
    return {
        name: 'Breath',
        update: function (timeMultiplier) {
            if (value >= Math.PI * 2) {
                value = 0;
            }

            var lightness = Math.cos(value) / -2 * range + vertTranslate;
            for (var i = 0; i < iris.leds.length; i++) {
                var hsv = iris.convert.RGBtoHSV(iris.leds[i][0], iris.leds[i][1], iris.leds[i][2]);
                iris.leds[i] = iris.convert.HSVtoRGB(hsv[0], hsv[1], hsv[2] * lightness);
            }

            value += 0.025 * timeMultiplier;
        }
    };
};
