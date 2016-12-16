#ifdef __AVR__
  #include <avr/power.h>
#endif

#include "computer-state.cpp"
#include "lights.cpp"

ComputerState* computerState = new ComputerState();
Lights* lights = new Lights();

void onBootCompleteListener () {
  Serial.println("booted");
  lights->startListening();
}

void onShutdownStartedListener () {
  Serial.println("shutting down");
}

void setup() {
  // This is for Trinket 5V 16MHz, you can remove these three lines if you are not using a Trinket
  #if defined (__AVR_ATtiny85__)
    if (F_CPU == 16000000) clock_prescale_set(clock_div_1);
  #endif
  // End of trinket special code

  Serial.begin(115200);
  Serial.println("===( SETUP )===");

  computerState->setOnBootCompleteListener(onBootCompleteListener);
  computerState->setOnShutdownStartedListener(onShutdownStartedListener);

  computerState->hook_setup();
  lights->hook_setup();

  lights->startRainbowCycle();
  lights->startFade();
}

void loop() {
  computerState->hook_loop();
  lights->hook_loop();

//  delay(1000/60);
}

