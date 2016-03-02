module.exports = function (iris) {
    return {
        name: 'Off',
        start: function () {
            for (var i = 0; i < iris.leds.length; i++) {
                iris.leds[i] = [0, 0, 0];
            }
        }
    };
};
