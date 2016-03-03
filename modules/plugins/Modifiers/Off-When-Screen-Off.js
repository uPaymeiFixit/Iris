module.exports = function () {
    return {
        name: 'Modifiers/Off When Screen Off',
        colorMode: 'HSV',
        update: function (leds) {
            if (false) {
                for (var i = 0; i < leds.length; i++) {
                    leds[i][2] = 0;
                }
            }

            return leds;
        }
    };
};
