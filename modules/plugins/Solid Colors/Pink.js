module.exports = function (iris) {
    for (var i = 0; i < iris.leds.length; i++) {
        iris.leds[i][0] = 255;
        iris.leds[i][1] = 20;
        iris.leds[i][2] = 147;
    }

    return {
        name: 'Pink'
    };
};
