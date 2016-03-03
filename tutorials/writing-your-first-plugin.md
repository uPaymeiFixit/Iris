# Writing Your First Plugin

The simplest base plugin is one to set a static color

```javascript
module.exports = function () {
  return {
    name: 'Red',
    update: function (leds) {
      for (var i = 0; i < leds.length; i++) {
        leds[i] = [255, 0, 0];
      }

      return leds;
    }
  };
};
```

The only truly _required_ value in a plugin is the name. Everything else is optional, although common sense would dictate that you should have a `start` and or an `update` method.

Method `start` and `update` accept a parameter `leds`, which is an array of colors to be assigned to the LEDs. They must then return this array.
