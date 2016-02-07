var lightness = 0;
var hue = Math.random();

module.exports = function (iris) {
    return {
        name: 'Pulse',
        update: function () {
            if (lightness >= Math.PI * 2) {
                lightness = 0;
                hue = Math.random();
            }
            var color = iris.HSVtoRGB(hue, 1, (Math.cos(lightness) / -2) + 0.5);
            for (var i = 0; i < iris.leds.length; i++) {
                iris.leds[i] = color;
            }
            lightness += 0.01;
        }
    };
};
