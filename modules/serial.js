var SerialPort = require('serialport').SerialPort;
var serial_port;
var baudrate = 115200;
var leds;

module.exports = {
    init: function (callback) {
        console.log('Initializing the serial server…');
        serial_port = new SerialPort('/dev/tty.usbmodem1491', {baudrate: baudrate}, false);
        if (callback) {
            callback();
        }
        return this;
    },
    start: function (callback) {
        // We must wait for this event to fire before interacting with the device
        console.log('Starting the serial server…');
        serial_port.open(function () {

            console.log('Serial connected…');

            serial_port.on('data', function (data) {
                console.log('data received: ' + data);
            });

            // /////////////////// THIS GOES SOMEWHERE ELSE //////////////////
            // Initialize the 2d leds array
            var NUM_LEDS = 17;
            leds = new Uint8Array(NUM_LEDS * 3);
            for (var i = 0; i < NUM_LEDS * 3; i++) {
                leds[i] = 0;
                // leds[i] = {r:0,g:0,b:0};
            }
            // var leds = new Uint8ClampedArray(NUM_LEDS);

            var t = 255;
            // setInterval(function () {
            //     for (i = 0; i <= NUM_LEDS - 1; i++) {
            //         t = (t == 255) ? 0 : 255;
            //         leds[i*3] = t;
            //         leds[i*3+1] = t;
            //         leds[i*3+2] = t;
            //     }
            //     module.exports.write(leds);
            // }, 1000 / 30);

            if (callback) {
                callback();
            }
        });
    },
    stop: function (callback) {
        console.log('Stopping the serial server…');
        serial_port.close(function () {
            console.log('Serial port has been closed.');
            if (callback) {
                callback();
            }
        });
    },

    write: function (leds) {
        if (serial_port.isOpen()) {
            var LEDbuffer = new Uint8Array(leds.length * 3);
            for (var i = 0; i < leds.length; i++) {
                LEDbuffer[(i * 3)] = leds[i][0];
                LEDbuffer[(i * 3) + 1] = leds[i][1];
                LEDbuffer[(i * 3) + 2] = leds[i][2];
            }

            var buf = new Buffer(LEDbuffer.buffer);
            serial_port.write(buf);
            return true;
        } else {
            return false;
        }
    },
    getLEDs: function () {
        return leds;
    }
};
