var SerialPort = require('serialport').SerialPort;
var serial_port;
var baudrate = 9600;
var leds;

module.exports = {
    init: function () {
        serial_port = new SerialPort('/dev/tty.usbmodem1471', {baudrate: baudrate}, false);
        return this;
    },
    start: function (callback) {
        // We must wait for this event to fire before interacting with the device
        console.log('Starting the serial server...');
        serial_port.open(function () {

            console.log('Connected!');

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
    stop: function () {
        console.log('Stopping the serial server...');
        serial_port.close(function () {
            console.log('Serial port has been closed.');
        });
    },

    write: function (leds) {
        if (serial_port.isOpen()) {
            // var new_leds = [];
            // for (var i = 0; i < leds.length; i++) {
            //     // console.log('Sending: (' + leds[i].r + ', ' + leds[i].g + ', ' + leds[i].b + ')');
            //     // new_leds[i * 3    ] = leds[i][0];
            //     // new_leds[i * 3 + 1] = leds[i][1];
            //     // new_leds[i * 3 + 2] = leds[i][2];
            //     serial_port.write(new Buffer(leds[i]));
            //     // serial_port.write(leds[i][1]);
            //     // serial_port.write(leds[i][2]);
            //
            // }
            const buf = new Buffer(leds.buffer);
            serial_port.write(buf);
            // console.log(buf);
            return true;
        } else {
            return false;
        }
    },
    getLEDs: function () {
        return leds;
    }
};
