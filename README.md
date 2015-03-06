# Blueprint

![Blueprint Diagram](http://i.imgur.com/Kc1iqli.png)

# Creating Shapes

All of the shapes in `Blueprint` use hooks to allow for the easy creation of custom shapes.

- [x] `getTag` &mdash; For specifying the root element's tag name;
- [ ] `addAttributes` &mdash; For applying custom attributes;
- [ ] `addMethods` &mdash; For adding specialised methods to the interface;

Shapes can be registered with the `registerComponent` method on the `Blueprint` object &ndash; it accepts a name (`string`) and an object (`Shape`).

```javascript
class Circle extends Shape {}
blueprint.registerComponent('circle', Circle);
```