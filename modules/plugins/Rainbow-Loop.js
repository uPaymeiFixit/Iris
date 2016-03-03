var value = 0;

module.exports = function () {
    return {
        name: 'Rainbow Loop',
        colorSpace: 'HSV',
        update: function (leds, timeMultiplier) {
            for (var i = 0; i < leds.length; i++) {
                var hue = value + (i / leds.length);
                if (hue > 1) {
                    hue -= 1;
                }
                leds[i] = [hue, 1, 1];
            }
            value += 0.01 * timeMultiplier;
            if (value >= 1) {
                value = 0;
            }

            return leds;
        }
    };
};
