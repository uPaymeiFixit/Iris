var value = 0;

module.exports = function (iris) {
    return {
        name: 'Rainbow Loop',
        update: function (timeMultiplier) {
            for (var i = 0; i < iris.leds.length; i++) {
                var hue = value + (i / iris.leds.length);
                if (hue > 1) {
                    hue -= 1;
                }
                var color = iris.convert.HSVtoRGB(hue, 1, 1);
                iris.leds[i] = color;
            }
            value += 0.01 * timeMultiplier;
            if (value >= 1) {
                value = 0;
            }
        }
    };
};
