#include <Arduino.h>
using namespace std;

class ComputerState {
  private:
    bool booted = false;
    bool shuttingDown = false;

    void (*onBootCompleteListener)();
    void (*onShutdownStartedListener)();

  public:
    ComputerState () {}

    void setOnBootCompleteListener (void (*callback)()) {
      onBootCompleteListener = callback;
    }

    void setOnShutdownStartedListener (void (*callback)()) {
      onShutdownStartedListener = callback;
    }

    void hook_setup () {

    }

    void hook_loop () {
      if (!booted && Serial.available() > 0) {
        onBootCompleteListener();
        booted = true;
      }

      if (!shuttingDown && booted && !Serial) {
        onShutdownStartedListener();
        shuttingDown = true;
      }
    }
};
