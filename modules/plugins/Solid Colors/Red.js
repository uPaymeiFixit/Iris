module.exports = function (iris) {
    return {
        name: 'Red',
        update: function () {
            for (var i = 0; i < iris.leds.length; i++) {
                iris.leds[i][0] = 255;
                iris.leds[i][1] = 0;
                iris.leds[i][2] = 0;
            }
        }
    };
};
