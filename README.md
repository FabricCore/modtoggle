# Toggle

Create toggleable modules and listen to events.

### Installation

#### Using [pully](https://github.com/FabricCore/pully)

```
/pully install toggle
```

#### Require as Dependency

```json
{
  "dependencies": {
    "toggle": "0.1.0"
  }
}
```

#### Manual Install

1. [Download **toggle**](https://github.com/FabricCore/modtoggle/archive/refs/heads/master.zip).
2. Unzip file content to _.minecraft/config/jscore/modules/toggle/_

The folder should look like this

```
.minecraft/config/jscore/
└── modules/
    └── toggle/
        └── package.json
```

## Commands

#### /toggle &lt;name&gt;

Toggle a toggleable.

In the unlikely scenario where the toggleable name clashes with a subcommand, use **_/toggle toggle &lt;name&gt;_** to specify the toggleable.

#### /toggle enable &lt;name&gt;

Enables a toggleable.

#### /toggle disable &lt;name&gt;

Disables a toggleable.

#### /toggle list &lt;page&gt;

List toggleables.

- If **_page_** is not specified, defaults to 1.

## Developer Guide

> Modules that provide a toggle should be prefixed with **toggle-**, such as **toggle-modulename**.

A **ToggleObject** is an object with the following fields.

| Field        | Type              | Description                                    |
| ------------ | ----------------- | ---------------------------------------------- |
| name         | String            | Lowercase formal name for the toggle (unique). |
| displayName  | String (optional) | Upper camel case name for the toggle.          |
| onActivate   | Fn()              | Function to run on toggle activate.            |
| onDeactivate | Fn()              | Function to run on toggle deactivate.          |

A toggle can be created by declaring the **ToggleObject** and registering it as a toggleable.

```js
let mytoggle = {
  name: "mytoggle",
  displayName: "MyToggle",

  counter: 0, // toggles can have state
  onTick: () => {
    console.log(myToggle.counter++);
  },

  onActivate: () => {
    // start listening to event on activate
    modtoggle.registerListener(
      ClientTickEvents.START_WORLD_TICK, // event to listen to
      mytoggle.onTick, // function to run on event
      "mytoggle-onTick", // unique identifer for listener: `toggleName-functionName`
      yarnwrap.Core, // event provider
    );
  },
  onDeactivate: () => {
    // stop listening to event on deactivate
    modtoggle.deregisterListener(
      ClientTickEvents.START_WORLD_TICK,
      "mytoggle-onTick",
    );
  },
};

modtoggle.registerToggle(mytoggle);
```

Some events allows a value to be returned, such as **ClientSendMessageEvents.ALLOW_CHAT**.

- If a listener returns a value, the value is returned immediately, skipping all other listeners.
- If all listeners does not return a value, then a **default value** is returned instead, this is **zero** for numerical values, or **true** for boolean values.

### Priority

When registering a listener, you can use an extra argument to specify the priority - lower number is higher priority.

```js
modtoggle.registerListener(
  ClientSendMessageEvents.MODIFY_CHAT,
  testchat.onSendMessage,
  "testchat-onSend",
  yarnwrap.Core,
  10,
);
```

Default priority is 100 if not specified.

### Pass Behaviour

For events that allows a value to be modified, multiple functions may be listening to the same event. To allow all functions to modify the value (and not just the first one), you will need to specify how the return value from one function is "passed" down to the next.

- **Pass by index**: specifies the index parameter that should be replaced by the modified value.

```js
// MODIFY_CHAT: (message) => String
// The modified value we want to pass is `message`, which is at index 0.
modtoggle.setPass(ClientSendMessageEvents.MODIFY_CHAT, 0);
```

- **Pass by modification**: For more complicated scenario, define a function to modify the value.

```js
// res - the return value of the previous function
// args - argument array
modtoggle.setPass(ClientSendMessageEvents.MODIFY_CHAT, (res, args) => {
  args[0] = res;
  // return true to continue passing on
  // return false to return current value of res
  return true;
});
```

yarntogglepass TODO provides a good number of pass behaviour for Fabric API listeners.

## Library Functions

#### modtoggle.activeToggles() → { name: isActive }

Return an index of active toggleables.

#### modtoggle.registerToggle(toggle: ToggleObject)

Register or update a toggleable.

#### modtoggle.deregisterToggle(name: String) → boolean

Deregister a toggleable, returns true if a toggleable is deregistered.

#### modtoggle.registerListener(event: [Event](https://wiki.fabricmc.net/tutorial:event_index), listener: Fn(...), listenerID: String, core: Core?, priority: Number?)

Listens to an event with a function.

- **Core** is the provider for the event, if not specified, defaults to **jscore.Core**.
- **priority** is set to 100 if not specified.

#### modtoggle.deregisterListener(event: [Event](https://wiki.fabricmc.net/tutorial:event_index), listenerID: String) → boolean

Remove a function from listening to an event, returns true if a listener is removed.

#### modtoggle.isActive(name: String) → boolean

Returns true if said module is active.

#### modtoggle.activate(name: String, message: boolean?)

Activates a registered toggle.

- If **_message_** is true, will print out non-error response messages, error message will always be printed out.
- If **_message_** is not specified, defaults to true.

#### modtoggle.deactivate(name: String, message: boolean?)

Deactivates an active toggle.

#### modtoggle.toggle(name: String, message: boolean?)

Activate a toggle if it is inactive, deactivates if it is active.

#### modtoggle.listToggles() → { name: \_ }

Returns a set of all toggles, active or not.

The **_key_** of the object is the name of the toggle, the **_value_** is an arbitrary value that does not matter.

#### modtoggle.setPass(event: [Event](https://wiki.fabricmc.net/tutorial:event_index), specifier: T)
***T: Number (for index) or function***

Set pass behaviour for an event.
