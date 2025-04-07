# modtoggle

Create modules that can be toggled on or off.

> Make sure to require `toggle` as a dependency for correct load order.

1. Create a toggle.

```js
let myToggle {
  name: "mytoggle", // required

  onTick: () => {
    console.log("tick!");
  }

  onActivate: () => { // required
    modtoggle.registerListener(ClientTickEvents.END_CLIENT_TICK, mytoggle.onTick, "mytoggle-onTick");
  }

  onDeactivate: () => { // required
    modtoggle.registerListener(ClientTickEvents.END_CLIENT_TICK, "mytoggle-onTick");
  }
};

modtoggle.registerToggle(myToggle);
```

2. Use the toggle.
```js
modtoggle.activate("mytoggle");
modtoggle.isActive("mytoggle"); // true

modtoggle.deactivate("mytoggle");
modtoggle.toggle("mytoggle");
```
