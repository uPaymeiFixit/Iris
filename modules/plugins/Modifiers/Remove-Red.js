module.exports = function () {
    return {
        name: 'Modifiers/Remove Red',
        colorMode: 'RGB',
        update: function (leds) {
            for (var i = 0; i < leds.length; i++) {
                leds[i][0] = 0;
            }

            return leds;
        }
    };
};
