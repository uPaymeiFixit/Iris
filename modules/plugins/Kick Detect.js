var brightness = 0;

module.exports = function (iris) {
    return {
        name: 'Kick Detect',
        colorSpace: 'HSV',
        update: function (leds) {
            if (iris.BeatDetect.isKick()) {
                brightness = 1;
            } else {
                brightness *= 0.65;
            }

            for (var i = 0; i < leds.length; i++) {
                leds[i] = [0, 0, brightness];
            }

            return leds;
        }
    };
};
