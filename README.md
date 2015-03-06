# Blueprint

![Travis](http://img.shields.io/travis/Wildhoney/Blueprint.svg?style=flat)
&nbsp;
![npm](http://img.shields.io/npm/v/getblueprint.svg?style=flat)
&nbsp;
![License MIT](http://img.shields.io/badge/License-MIT-lightgrey.svg?style=flat)

* **Heroku**: [http://getblueprint.herokuapp.com/](http://getblueprint.herokuapp.com/)
* **Bower:** `bower install get-blueprint`

---

![Blueprint Diagram](http://i.imgur.com/Kc1iqli.png)

# Getting Started

Adding a shape is as simple as passing in a string representation for your shape. For example `blueprint.add('rect')` would add a rectangle to the canvas.

```javascript
var rect = blueprint.add('rect');
```

In the above case the `rect` is an instance of `Interface` which encapsulates a lot of useful accessor methods for manipulating the shape, without exposing you to the complexity beneath.

You may set attributes using `setAttr` and get attributes using `getAttr` &ndash; `Interface` also has shorthand methods for setting attributes individually, such as `x()`, `y()`, `height()`, `width()`, etc...

**Note:** The `z()` method is for setting the z-index but isn't applied directly to your `rect` shape, it is instead applied to the `g` element that is wrapped around your shape. When you define the z-index for your shape, the `Events.REORDER` event will be dispatched and all elements will be re-ordered using their z-indexes using `d3.sort`.

## Developers: Data Attribute

Mostly for debugging purposes, each `Interface` object has a `toString` method which returns the ID of the attribute (`[object Interface: BP5]`) which corresponds to the `data-id` &mdash; which [can be changed](#change-data-attribute) &mdash; attribute on your shape's `g` element: `<g data-id="BP5">...</g>`. Each `Shape` object also has a `toString` method which returns the shape's ID (`[object Rect: MP5]`) which is a nexus between the `Shape` and its `Interface`. You may also return the `Shape` instance &mdash; although it's not recommended &mdash; by taking it from the `blueprint.shapes` array.

```javascript
this.shapes.push({
    shape: shape, // all of the complexity.
    interface: shape.getInterface() // interface developers deal with.
});
```

For the `all` method the `interface` of each `shapes` object is returned:

```javascript
return this.shapes.map((shape) => shape.interface);
```

### Change Data Attribute

By default `Blueprint` sets the `data-id` attribute on each element's group, but this can be changed using the `constructor`:

```javascript
var blueprint = new Blueprint(svg, {
    dataAttribute: 'data-blueprint-id'
});
```

# Creating Shapes

All of the shapes in `Blueprint` use hooks to allow for the easy creation of custom shapes.

- [x] `getTag` &mdash; For specifying the root element's tag name;
- [ ] `addAttributes` &mdash; For applying custom attributes;
- [ ] `addMethods` &mdash; For adding specialised methods to the interface;

Shapes can be registered with the `register` method on the `Blueprint` object &ndash; it accepts a name (`string`) and an object (`Shape`).

```javascript
class Circle extends Shape {}
blueprint.register('circle', Circle);
```

## Removing Shapes

Once you've created a shape, you will probably wish to remove it at some point. For this the `Interface` object has a `remove` method which dispatches a `Events.REMOVE` event to the `Blueprint` object. By using this method to remove the shape, `Blueprint` can ensure the cleanup is invoked to prevent memory leaks.

```javascript
var rect = blueprint.add('rect').fill('blue').x(100);
rect.remove(); // bye bye.
```