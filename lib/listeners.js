modtoggle.init = () => {
    modtoggle.eventIDCounter = 0;

    // Map<Event, EventID>
    modtoggle.eventID = {};

    // Map<EventID, Map<ListenerID, Listener>>
    modtoggle.events = {};

    // Map<Name, Toggle>
    modtoggle.toggles = {};

    // Map<Name, Bool>
    // modtoggle.activeToggles = {};

    modtoggle.handleEvent = function (eventID, ...vararg) {
        Object.values(modtoggle.events[eventID]).forEach(function (handle) {
            handle.apply(null, vararg);
        });
    };
};

modtoggle.activeToggles = (name, f) => {
    return modkeep.get("modtoggle/active", {}, f)[name];
};

modtoggle.registerToggle = (toggle) => {
    if (
        modtoggle.activeToggles(toggle.name) &&
        modtoggle.toggles[toggle.name] != undefined
    )
        modtoggle.toggles[toggle.name].onDeactivate();
    modtoggle.toggles[toggle.name] = toggle;
    if (modtoggle.activeToggles(toggle.name))
        modtoggle.toggles[toggle.name].onActivate();

    if (modtoggle.activeToggles(toggle.name)) modtoggle.activate(toggle.name);
};

modtoggle.deregisterToggle = (name) => {
    if (typeof name.name == "string") name = name.name;
    if (activeToggles(name)) modtoggle.toggles[name].onDeactivate();
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

modtoggle.isActive = (name) => modtoggle.activeToggles(name) == true;

modtoggle.activate = (name) => {
    if (modtoggle.toggles[name] == undefined)
        console.error(`Toggle "${name}" not found`);
    else {
        modtoggle.toggles[name].onActivate();
        modtoggle.activeToggles(name, (obj) => {
            obj[name] = true;
            return obj;
        });
    }
};

modtoggle.deactivate = (name) => {
    if (modtoggle.activeToggles(name)) {
        modtoggle.toggles[name].onDeactivate();
        modtoggle.activeToggles(name, (obj) => {
            delete obj[name];
            return obj;
        });
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
        if (modtoggle.activeToggles(entry)) out[entry] = true;
        else out[entry] = false;
    });

    return out;
};

modtoggle.printList = (page) => {
    let fullList = Object.entries(modtoggle.listToggles()).sort(([n1], [n2]) =>
        n1.localeCompare(n2),
    );
    let res = fullList.slice((page - 1) * 10, page * 10);
    let max = Math.ceil(fullList.length / 10);
    page = Math.min(page, max);

    if (res.length == 0) return console.log("\u00A76This page is empty.");

    let entries = res
        .map(([name, active]) =>
            active
                ? `\u00A77[\u00A7aEnabled\u00A77] \u00A7a${name}`
                : `\u00A77[\u00A7cDisabled\u00A77] \u00A7c${name}`,
        )
        .join("\n");
    console.log(
        `${entries}\n\u00A7bPage \u00A7e${page} \u00A7bof \u00A7e${max}`,
    );
};
