# Draft

![Travis](http://img.shields.io/travis/Wildhoney/Draft.svg?style=flat)
&nbsp;
![npm](http://img.shields.io/npm/v/get-draft.svg?style=flat)
&nbsp;
![License MIT](http://img.shields.io/badge/License-MIT-lightgrey.svg?style=flat)

* **Heroku**: [http://getdraft.herokuapp.com/](http://getdraft.herokuapp.com/)
* **Bower:** `bower install get-draft`

---

![Draft Diagram](http://i.imgur.com/Kc1iqli.png)

# Getting Started

Adding a shape is as simple as passing in a string representation for your shape. For example `draft.add('rect')` would add a rectangle to the canvas.

```javascript
var rect = draft.add('rect');
```

In the above case the `rect` is an instance of `Interface` which encapsulates a lot of useful accessor methods for manipulating the shape, without exposing you to the complexity beneath.

You may set attributes using `setAttr` and get attributes using `getAttr` &ndash; `Interface` also has shorthand methods for setting attributes individually, such as `x()`, `y()`, `height()`, `width()`, etc...

`Interface` also has the `attr` method for setting or getting depending on if a value was passed:

```javascript
var value = Math.random();
expect(rectangle.width(value).width()).toEqual(value); // √
```

**Note:** The `z()` method is for setting the z-index but isn't applied directly to your `rect` shape, it is instead applied to the `g` element that is wrapped around your shape. When you define the z-index for your shape, the `Events.REORDER` event will be dispatched and all elements will be re-ordered using their z-indexes using `d3.sort`. See [Z-Index Management](#z-index-management) for further information.

## Debugging: Data Attribute

Mostly for debugging purposes, each `Interface` object has a `toString` method which returns the ID of the attribute (`[object Interface: BP5]`) which corresponds to the `data-id` &mdash; which [can be changed](#change-data-attribute) &mdash; attribute on your shape's `g` element: `<g data-id="BP5">...</g>`. Each `Shape` object also has a `toString` method which returns the shape's ID (`[object Rect: BP5]`) which is a nexus between the `Shape` and its `Interface`. You may also return the `Shape` instance &mdash; although it's not recommended &mdash; by taking it from the `draft.shapes` array.

```javascript
this.shapes.push({
    shape: shape, // all of the complexity.
    interface: shape.getInterface() // interface developers deal with.
});
```

For the `draft.all` method the `interface` of each `shapes` object is returned:

```javascript
return this.shapes.map((model) => model.interface);
```

### Change Data Attribute

By default `Draft` sets the `data-id` attribute on each element's group, but this can be changed using the `constructor`:

```javascript
var draft = new Draft(svg, {
    dataAttribute: 'data-draft-id'
});
```

# Creating Shapes

All of the shapes in `Draft` use hooks to allow for the easy creation of custom shapes.

- [x] `getTag` &mdash; For specifying the root element's tag name;
- [x] `addInterface` &mdash; For adding the specialised interface;
- [ ] `addAttributes` &mdash; For applying custom attributes;
- [ ] `addElements` &mdash; For appending elements to the group/shape elements;

Shapes can be registered with the `register` method on the `Draft` object &ndash; it accepts a name (`string`) and an object (`Shape`).

```javascript
class Circle extends Shape {}
draft.register('circle', Circle);
```

## Removing Shapes

Once you've created a shape, you will probably wish to remove it at some point. For this, the `Interface` object has a `remove` method which dispatches an `Events.REMOVE` event to the `Draft` object. By using this method to remove the shape, `Draft` can ensure the cleanup is invoked to prevent memory leaks.

```javascript
var rect = draft.add('rect').fill('blue').x(100);
rect.remove(); // bye bye.
```

# Dispatchers

Each `Shape` has a `Dispatcher` (`this.dispatcher`) which is capable of dispatching events that affect **every** shape, whereas `Feature` and `Interface` objects **only** have dispatchers capable of dispatching events to the `Shape` object &mdash; if an event is intended to be broadcast to all shapes, then it's the responsibility of the `Shape` object to relay the dispatched event to the `Draft` object, such as in the case of `Events.DESELECT` from `Selectable`.

<img src="http://i.imgur.com/jdm7RDX.png" alt="Dispatcher Architecture" width="540" />

In the above diagram we can see that `Draft` has the main dispatcher that it injects into `Shape` &mdash; each `Interface` and `Feature` have their own dispatchers.

# Z-Index Management

Technically SVG doesn't have a `z-index` property as CSS does, and therefore the Z value is determined by the insertion order of the elements. `Draft` provides a handful of convenience methods for managing the Z index. Aside from the typical `z` method which accepts **any** numerical value &mdash; including `Infinity` and `-Infinity` which will be translated to in between `1` and `groups.length` &mdash; `Draft` has the following methods:

- `sendToBack()` sends the shape to the back &mdash; `1`;
- `bringToFront()` brings the shape to the front &mdash; `groups.length`;
- `sendBackwards()` sends the shape backwards one step &mdash; `z() - 1`;
- `bringForwards()` brings the shape forwards one step &mdash; `z() + 1`;

```javascript
// shufflin', shufflin'...
var rect = draft.add('rect').z(-Infinity);
rect.bringToFront().sendBackwards().bringForwards().sendToBack();
```