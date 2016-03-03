# Working with HSV

## What is HSV?

HSV is, like RGB, is a way to represent colors numerically.

HSV is an acronym for hue, saturation, value (or brightness)

Many color pickers will use a HSV cylinder to represent the colors space.
![HSV color picker](/resources/images/hsv-color-picker.png)
In this picker, the hue is the angle around the circle, the saturation is the length of the line from the center of the circle to the picker, and the value or brightness is set using the slider at the bottom.

Here is a render of the HSV cylinder
![HSV cylinder](/resources/images/hsv-cylinder.png)

## Reasons to use

HSV generally allows you to make generated colors look nicer. Some use cases include:
* Picking a good looking random color is as simple as `hsv[rand(0,360), 1, 1]`
* Rotating a hue around the color wheel: `hsv[hue++, 1, 1]`
* Simple breathing effect: `hsv[hue, 1, cos(val++)]`

## Use

Hue is the base color, saturation adds white to it, and value (brightness) adds black to it.

* `hsv[*,*,0]` is always black
* `hsv[*,0,1]` is always white
* `hsv[*,0,0.5]` is always middle-gray
* `hsv[0,1,1]` is pure red
* `hsv[360,1,1]` is also pure red
