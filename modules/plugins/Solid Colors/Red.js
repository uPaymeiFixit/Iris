module.exports = function () {
    return {
        name: 'Red',
        colorSpace: 'HSV',
        update: function (leds) {
            for (var i = 0; i < leds.length; i++) {
                leds[i] = [0, 1, 1];
            }

            return leds;
        }
    };
};
