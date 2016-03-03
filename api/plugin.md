# Plugin

## Methods

### `start(leds)`

* `leds` `array` of colors

returns leds `array`

### `update(leds, timeMultiplier)`

* `leds` array of colors
* `timeMultiplier` `Number` time multiplier in order to keep constant rate of change no matter the tick rate

returns leds `array`

## Values

### `name`

* `string`

The name of the plugin

### `colorSpace`

* `string['RGB', 'HSV']`

The colors space the plugin works in

If not set, defaults to `'RGB'`
