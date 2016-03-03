module.exports = function () {
    return {
        name: 'Off',
        start: function (leds) {
            for (var i = 0; i < leds.length; i++) {
                leds[i] = [0, 0, 0];
            }

            return leds;
        }
    };
};
