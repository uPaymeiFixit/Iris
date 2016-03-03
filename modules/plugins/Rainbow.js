var value = 0;

module.exports = function () {
    return {
        name: 'Rainbow',
        update: function (leds) {
            value += 0.0001;

            for (var i = 0; i < leds.length; i++) {
                leds[i] = [value % 1, 1, 1];
            }

            return leds;
        }
    };
};
