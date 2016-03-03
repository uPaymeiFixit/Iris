module.exports = function () {
    return {
        name: 'Red',
        colorMode: 'HSV',
        update: function (leds) {
            for (var i = 0; i < leds.length; i++) {
                leds[i] = [0, 1, 1];
            }
        }
    };
};
