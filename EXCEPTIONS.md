# Blueprint: Exceptions

## Instance of Shape

> Custom shape must be an instance of `Shape`.

**Solution:** Ensure the shape you're registering extends `Shape`.

## Overwriting Existing Shapes

> Refusing to overwrite existing `name` shape without explicit overwrite.

**Solution:** You're attempting to overwrite an existing shape which `Blueprint` is refusing to do, unless you explicitly specify that you're intending to overwrite an existing shape &ndash; in which case you can specify the third argument &mdash; the `overwrite` property &mdash; as `true`:

```javascript
// explicitly overwrite existing circle.
blueprint.register('circle', Circle, true);
```