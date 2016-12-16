#include <Arduino.h>
using namespace std;

#include <Adafruit_NeoPixel.h>

#define PIN 6
const float COLOR_R_SCALAR = 0.57;
const float COLOR_G_SCALAR = 0.29;
const float COLOR_B_SCALAR = 1;

class Lights {
  private:
    // Parameter 1 = number of pixels in strip
    // Parameter 2 = Arduino pin number (most are valid)
    // Parameter 3 = pixel type flags, add together as needed:
    //   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
    //   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
    //   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
    //   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
    //   NEO_RGBW    Pixels are wired for RGBW bitstream (NeoPixel RGBW products)
    Adafruit_NeoPixel strip = Adafruit_NeoPixel(114, PIN, NEO_GRB + NEO_KHZ800);
    
    // IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
    // pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
    // and minimize distance between Arduino and first pixel.  Avoid connecting
    // on a live circuit...if you must, connect GND first.

    uint32_t cycle_duration = 0;
    uint32_t cycle_length = 2000;
    uint32_t cycle_start = millis();

    bool fading = false;
    uint32_t fade_duration = 5000;
    bool fade_up = true;
    uint32_t fade_start = millis();

    enum State {
      OFF = 0,
      LISTENING = 1,
      PURE = 2,
      RAINBOW_CYCLE = 3
    };

    State state = State::OFF;

    uint32_t rainbow_cycle_j = 0;

  public:
    Lights () {}

    void hook_setup () {
      strip.begin();
      strip.show(); // Initialize all pixels to 'off'
    }

    void hook_loop () {
      uint16_t i;

      switch (state) {
        case State::OFF :
          for(i = 0; i < strip.numPixels(); i++) {
            strip.setPixelColor(i, strip.Color(0, 0, 0));
          }
          break;
        case State::LISTENING :
          for(i = 0; i < strip.numPixels(); i++) {
            strip.setPixelColor(i, strip.Color(0, 0, 0));
          }
          break;
        case State::PURE :
          for(i = 0; i < strip.numPixels(); i++) {
            strip.setPixelColor(i, strip.Color(255, 255, 255));
          }
          break;
        case State::RAINBOW_CYCLE :
          if (cycle_duration == 0 || cycle_start + cycle_duration < millis()) {
            for(i = 0; i < strip.numPixels(); i++) {
              strip.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + rainbow_cycle_j) & 255));
            }
            rainbow_cycle_j++;
          } else {
            state = State::OFF;
          }
          break;
      }

      if (fading) {
        float fadePercent = (float) (millis() - fade_start) / (float) fade_duration;

        if (fadePercent > 1) {
          fadePercent = 1;
          fading = false;
        }

        for (i = 0; i < strip.numPixels(); i++) {
          uint32_t originalColor = strip.getPixelColor(i);
          uint32_t newColor[3];
          UnColor(originalColor, newColor);

          for (int j = 0; j < 3; j++) {
            newColor[j] = newColor[j] * fadePercent;
          }

          strip.setPixelColor(i, strip.Color(newColor[0], newColor[1], newColor[2]));
        }
      }

      strip.show();
    }

    void startRainbowCycle(uint32_t cycle_length = 2000, uint32_t duration = 0) {
      Serial.println("Starting rainbow cycle");

      this->cycle_duration = duration;
      this->cycle_length = cycle_length;
      cycle_start = millis();

      rainbow_cycle_j = 0;

      state = State::RAINBOW_CYCLE;
    }

    void startListening() {
      Serial.println("Starting listening");

      state = State::LISTENING;
    }

    void stopListening() {
      Serial.println("Stopping listening");

      state = State::OFF;
    }

    void startFade(uint32_t fade_duration = 5000, bool fade_up = true) {
      Serial.println("Starting fade");

      fading = true;
      this->fade_duration = fade_duration;
      this->fade_up = fade_up;
      fade_start = millis();

      if (state == State::OFF) {
        state = State::PURE;
      }
    }

    // Input a value 0 to 255 to get a color value.
    // The colours are a transition r - g - b - back to r.
    uint32_t Wheel(byte WheelPos) {
      WheelPos = 255 - WheelPos;
      if(WheelPos < 85) {
        return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
      }
      if(WheelPos < 170) {
        WheelPos -= 85;
        return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
      }
      WheelPos -= 170;
      return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
    }
    
    uint32_t accurateColor (uint32_t r, uint32_t g, uint32_t b) {
      return strip.Color(r * COLOR_R_SCALAR, g * COLOR_G_SCALAR, b * COLOR_B_SCALAR);
    }

    void UnColor (uint32_t packed, uint32_t (&unpacked)[3]) {
      unpacked[0] = ((packed >> 16) & 0xFF);
      unpacked[1] = ((packed >> 8) & 0xFF);
      unpacked[2] = ((packed) & 0xFF);
    }
};

