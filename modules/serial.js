var SerialPort = require('serialport').SerialPort;
var pluginAPI = require('./plugin_api')();
var serial_port;
var baudrate = 115200;
var LEDbuffer;

var constrain = function (x, min, max) {
    if (x > max) {
        x = max;
    } else if (x < min) {
        x = min;
    }
    return x;
};

module.exports = {
    init: function (callback) {
        console.log('Initializing the serial server…');
        serial_port = new SerialPort('/dev/tty.usbserial-A6009P4D', {baudrate: baudrate}, false);
        if (callback) {
            callback();
        }
        return this;
    },
    start: function (callback) {
        // We must wait for this event to fire before interacting with the device
        console.log('Starting the serial server…');
        serial_port.open(function () {

            if (serial_port.isOpen()) {
                console.log('Serial connected…');
                serial_port.on('error', function (error) {
                    console.error(error);
                });
            } else {
                console.error('Failed to connect…');
            }

            // serial_port.on('data', function (data) {
            //     console.log('data received: ' + data);
            // });

            // /////////////////// THIS GOES SOMEWHERE ELSE //////////////////
            // Initialize the 2d leds array
            var NUM_LEDS = 17;
            LEDbuffer = new Uint8Array(NUM_LEDS * 3);
            for (var i = 0; i < NUM_LEDS * 3; i++) {
                LEDbuffer[i] = 0;
            }

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
        if (serial_port && serial_port.isOpen()) {
            for (var i = 0; i < leds.length; i++) {
                var led = pluginAPI.convert.HSVtoRGB(constrain(leds[i][0], 0, 1), constrain(leds[i][1], 0, 1), constrain(leds[i][2], 0, 1));
                LEDbuffer[(i * 3)] = Math.round(led[0]);
                LEDbuffer[(i * 3) + 1] = Math.round(led[1]);
                LEDbuffer[(i * 3) + 2] = Math.round(led[2]);
            }

            var buf = new Buffer(LEDbuffer.buffer);
            serial_port.write(buf);
            return true;
        } else {
            return false;
        }
    }
};
