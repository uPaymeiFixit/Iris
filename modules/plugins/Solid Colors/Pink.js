module.exports = function () {
    return {
        name: 'Purple',
        colorMode: 'HSV',
        update: function (leds) {
            for (var i = 0; i < leds.length; i++) {
                leds[i] = [0.7528, 1, 0.62];
            }
        }
    };
};
