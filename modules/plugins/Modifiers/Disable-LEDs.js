var disabled = [{start: 3, stop: 6}, 9];

module.exports = function () {
    return {
        name: 'Modifiers/Disable LEDs',
        colorMode: 'HSV',
        update: function (leds) {
            for (var i = 0; i < disabled.length; i++) {
                if (disabled[i].start) {
                    for (var j = disabled[i].start; j <= disabled[i].stop; j++) {
                        leds[j][2] = 0;
                    }
                } else {
                    leds[disabled[i]][2] = 0;
                }
            }

            return leds;
        }
    };
};
