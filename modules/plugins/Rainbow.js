var value = 0;

module.exports = function (iris) {
    return {
        name: 'Rainbow',
        update: function () {
            value += 0.0001;

        	for (var i = 0; i < iris.leds.length; i++) {
        		var rgb = iris.HSVtoRGB(value%1, 1, 1);
        		iris.leds[i][0] = rgb.r;
        		iris.leds[i][1] = rgb.g;
        		iris.leds[i][2] = rgb.b;
        	}
        }
    };
};
