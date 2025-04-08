modtoggle.init = () => {
    modtoggle.eventIDCounter = 0;

    // Map<Event, EventID>
    modtoggle.eventID = {};

    // Map<EventID, Map<ListenerID, Listener>>
    modtoggle.events = {};

    // Map<Name, Toggle>
    modtoggle.toggles = {};

    // Map<Name, Bool>
    modtoggle.activeToggles = {};

    modtoggle.handleEvent = function (eventID, ...vararg) {
        Object.values(modtoggle.events[eventID]).forEach(function (handle) {
            handle.apply(null, vararg);
        });
    };
};

modtoggle.registerToggle = (toggle) => {
    if (modtoggle.activeToggles[toggle.name])
        modtoggle.toggles[toggle.name].onDeactivate();
    modtoggle.toggles[toggle.name] = toggle;
    if (modtoggle.activeToggles[toggle.name])
        modtoggle.toggles[toggle.name].onActivate();
};

modtoggle.deregisterToggle = (name) => {
    if (typeof name.name == "string") name = name.name;
    if (activeToggles[name]) modtoggle.toggles[name].onDeactivate();
    return delete modtoggle.toggles[name];
};

modtoggle.registerListener = (event, listener, listenerID) => {
    if (modtoggle.eventID[event] == undefined) {
        let id = (modtoggle.eventIDCounter++).toString();
        modtoggle.eventID[event] = id;
        modtoggle.events[id] = {};

        let runnable = Core.runnable(
            `modtoggle-listener-${id}`,
            `function onEvent(...vararg) { modtoggle.handleEvent.apply(null, ["${id}"].concat(vararg)); }`,
        );
        event.register(runnable);
    }

    listenerID ??= listener.toString();

    modtoggle.events[modtoggle.eventID[event]][listenerID] = listener;
};

modtoggle.deregisterListener = (event, listenerID) => {
    return delete modtoggle.events[modtoggle.eventID[event]][listenerID];
};

modtoggle.isActive = (name) => modtoggle.activeToggles[name] == true;

modtoggle.activate = (name) => {
    if (modtoggle.toggles[name] == undefined)
        console.error(`Toggle "${name}" not found`);
    else {
        modtoggle.toggles[name].onActivate();
        modtoggle.activeToggles[name] = true;
    }
};

modtoggle.deactivate = (name) => {
    if (modtoggle.activeToggles[name]) {
        modtoggle.toggles[name].onDeactivate();
        delete modtoggle.activeToggles[name];
    } else console.error(`Toggle "${name}" is not active`);
};

modtoggle.toggle = (name) => {
    if (modtoggle.toggles[name] == undefined) {
        console.error(`Toggle "${name}" not found`);
    } else {
        if (modtoggle.isActive(name)) modtoggle.deactivate(name);
        else modtoggle.activate(name);
    }
};

modtoggle.listToggles = () => {
    let out = {};

    Object.keys(modtoggle.toggles).forEach((entry) => {
        if (modtoggle.activeToggles[entry]) out[entry] = true;
        else out[entry] = false;
    });

    return out;
};
