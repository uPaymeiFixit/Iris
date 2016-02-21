var SerialPort = require('serialport').SerialPort;
var serial_port;
var baudrate = 115200;
var LEDbuffer;

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
    }
};
