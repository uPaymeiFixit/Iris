#include <Adafruit_NeoPixel.h>

// The PWM pin that the LED strip is connected to
#define PIN 6
// Serial baud rate. Should match desktop program.
#define BAUD_RATE 115200
// Time in between beacons
#define BEACON_PERIOD 500
// Unique byte that the desktop program should recognize
#define BEACON_KEY 42

int NUM_LEDS = 51;

Adafruit_NeoPixel leds;

void setup()
{
    leds = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);

    leds.begin();

    // Reset color of all LEDs to black
    for(int i = 0; i < NUM_LEDS; i++)
    {
        leds.setPixelColor(i, leds.Color(0, 0, 0));
    }
    leds.show();

    Serial.begin(BAUD_RATE);
}

int buffer[NUM_LEDS*3];
int buffer_length = 0;
int last_beacon = 0;
void loop()
{
    // If BEACON_PERIODms has passed, send beacon to let the
    //   program know that we are an arduino running the program.
    if (millis() > last_beacon+BEACON_PERIOD)
    {
        last_beacon = millis();
        Serial.write(BEACON_KEY);
    }

    // NUM_LEDS*3 bytes are expected to be sent all at the "same time".
    while (Serial.available() > 0)
    {
        // So as soon as we receive each byte, we need to store
        //   it in our own buffer as to not overflow the Serial buffer.
        buffer[buffer_length++] = Serial.read();

        // After we have filled up the buffer, we will set the led strip
        //   up with that data. It should be formatted as follows:
        //   [red0, green0, blue0, red1, green1, blue1, (...), redn, greenn, bluen]
        if (buffer_length == NUM_LEDS*3)
        {
            for(int i = 0; i < NUM_LEDS; i++)
            {
                // TODO: Verify that this is producing the correct colors
                leds.setPixelColor(i, leds.Color(buffer[i*3], buffer[i*3+1], buffer[i*3+2]));
            }
            leds.show();
            buffer_length = 0;
        }
    }
}
