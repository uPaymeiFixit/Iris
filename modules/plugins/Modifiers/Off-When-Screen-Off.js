module.exports = function (iris) {
    return {
        name: 'Modifiers/Off When Screen Off',
        update: function () {
            if (false) {
                for (var i = 0; i < iris.leds.length; i++) {
                    iris.leds[i] = [0, 0, 0];
                }
            }
        }
    };
};
