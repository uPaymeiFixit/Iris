module.exports = function (iris) {
    return {
        name: 'Kick Detect Color',
        colorMode: 'HSV',
        start: function () {
            iris.BeatDetect.setSensitivity(250);
        },
        update: function (leds) {
            if (iris.BeatDetect.isKick()) {
                var hue = Math.random();
                for (var i = 0; i < leds.length; i++) {
                    leds[i] = [hue, 1, 1];
                }
            }

            return leds;
        }
    };
};
