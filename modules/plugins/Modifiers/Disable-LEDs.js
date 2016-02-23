var disabled = [{start: 3, stop: 6}, 9];

module.exports = function (iris) {
    return {
        name: 'Modifiers/Disable LEDs',
        update: function () {
            for (var i = 0; i < disabled.length; i++) {
                if (disabled[i].start) {
                    for (var j = disabled[i].start; j <= disabled[i].stop; j++) {
                        iris.leds[j] = [0, 0, 0];
                    }
                } else {
                    iris.leds[disabled[i]] = [0, 0, 0];
                }
            }
        }
    };
};
