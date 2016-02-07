module.exports = function (iris) {
    return {
        name: 'Kick Detect Color',
        start: function () {
            iris.BeatDetect.setSensitivity(250);
        },
        update: function () {
            if (iris.BeatDetect.isKick()) {
        		var rgb = iris.HSVtoRGB( Math.random(), 1, 1 );
        		for( var i = 0; i < iris.leds.length; i++ )
        		{
        			iris.leds[i][0] = rgb.r;
        			iris.leds[i][1] = rgb.g;
        			iris.leds[i][2] = rgb.b;
        		}
        	}
        }
    };
};
