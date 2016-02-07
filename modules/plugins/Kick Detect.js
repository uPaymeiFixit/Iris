var brightness = 0;

module.exports = function (iris) {
    return {
        name: 'Kick Detect',
        update: function () {
            if (iris.BeatDetect.isKick()) {
        		brightness = 255;
        	} else {
        		brightness *= 0.65;
            }

        	for(var i = 0; i < iris.leds.length; i++)
        	{
        		iris.leds[i][0] = brightness;
        		iris.leds[i][1] = brightness;
        		iris.leds[i][2] = brightness;
        	}
        }
    };
};
