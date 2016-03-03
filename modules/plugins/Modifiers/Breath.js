var value = 0;

var max = 1;
var min = 0.039;
var range = (max - min);

var vertTranslate = (range / 2) + min;

module.exports = function () {
    return {
        name: 'Modifiers/Breath',
        colorSpace: 'HSV',
        update: function (leds, timeMultiplier) {
            if (value >= Math.PI * 2) {
                value = 0;
            }

            var lightness = Math.cos(value) / -2 * range + vertTranslate;
            for (var i = 0; i < leds.length; i++) {
                leds[i][2] *= lightness;
            }

            value += 0.025 * timeMultiplier;

            return leds;
        }
    };
};
