# Modifier Plugins

A simple modifier plugin to disable the first LED

```javascript
module.exports = function () {
  return {
    name: 'Modifiers/Disable LEDs',
    colorSpace: 'HSV',
    update: function (leds) {
      leds[0][2] = 0;

      return leds;
    }
  };
};
```
