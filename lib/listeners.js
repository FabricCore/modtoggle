modtoggle.init = () => {
    modtoggle.eventIDCounter = 0;

    // Map<Event, EventID>
    modtoggle.eventID = {};

    // Map<EventID, Event>
    modtoggle.eventIDReverse = {};

    // Map<EventID, Map<ListenerID, Listener>>
    modtoggle.events = {};

    // Map<Name, Toggle>
    modtoggle.toggles = {};

    // Map<EventID, OrderedArray<{ Listener, ModuleName }>>
    modtoggle.queues = {};

    // Map<Event, ArgumentIndex>
    modtoggle.passes = {};

    // Map<Name, Bool>
    // modtoggle.activeToggles = {};
};

modtoggle.setPass = (event, index) => {
    if (index == -1) delete modtoggle.passes[event];
    else modtoggle.passes[event] = index;
};

modtoggle.handleEvent = function (eventID, ...vararg) {
    let res;
    let passIndex = modtoggle.passes[modtoggle.eventIDReverse[eventID]];
    let passMap;
    switch (typeof passIndex) {
        case "number":
            passMap = () => {
                vararg[passIndex] = res;
                return true;
            };
            break;
        case "function":
            passMap = () => passIndex(res, vararg);
            break;
    }
    for (let { name, listener } of modtoggle.queues[eventID] ?? []) {
        try {
            res = listener.apply(null, vararg);

            if (res == undefined) continue;
            if (passMap !== undefined) {
                if (!passMap()) return res;
            } else return res;
        } catch (e) {
            console.error(
                `An error occured when running toggle listener "${name}": ${e}`,
            );
        }
    }

    return res;
};

modkeep.get("modtoggle/config", {}, (obj) => {
    obj.pageSize = 10;
    return obj;
});

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
        modtoggle.activate(toggle.name, false);
};

modtoggle.deregisterToggle = (name) => {
    if (typeof name.name == "string") name = name.name;
    if (activeToggles(name)) modtoggle.toggles[name].onDeactivate();
    return delete modtoggle.toggles[name];
};

modtoggle.makeListenerQueue = (eventID) => {
    let listeners = Object.entries(modtoggle.events[eventID]);
    listeners.sort(
        ([_, { _, priority: p1 }], [_, { _, priority: p2 }]) => p1 - p2,
    );

    modtoggle.queues[eventID] = listeners.map(([name, { listener }]) => {
        return { name, listener };
    });
};

modtoggle.registerListener = (
    event,
    listener,
    listenerID,
    core = Core,
    priority = 100,
) => {
    if (modtoggle.eventID[event] == undefined) {
        let id = (modtoggle.eventIDCounter++).toString();
        modtoggle.eventID[event] = id;
        modtoggle.eventIDReverse[id] = event;
        modtoggle.events[id] = {};

        let runnable = core.runnable.create(
            `modtoggle-listener-${id}`,
            `function onEvent(...vararg) { return modtoggle.handleEvent.apply(null, ["${id}"].concat(vararg)); }`,
        );
        event.register(runnable);
    }

    listenerID ??= listener.toString();

    let eventID = modtoggle.eventID[event];
    modtoggle.events[eventID][listenerID] = {
        listener,
        priority,
    };
    modtoggle.makeListenerQueue(eventID);
};

modtoggle.deregisterListener = (event, listenerID) => {
    let eventID = modtoggle.eventID[event];
    let deleted = delete modtoggle.events[eventID][listenerID];
    modtoggle.makeListenerQueue(eventID);
    return deleted;
};

modtoggle.isActive = (name) => modtoggle.activeToggles(name) == true;

modtoggle.activate = (name, message = true) => {
    if (modtoggle.toggles[name] == undefined)
        console.error(`Toggle "${name}" not found`);
    else {
        modtoggle.toggles[name].onActivate();
        modtoggle.activeToggles(name, (obj) => {
            if (message) {
                let display = modtoggle.toggles[name].displayName ?? name;
                if (obj[name])
                    console.log(
                        `\u00A77[\u00A7aUnchanged\u00A77] \u00A7a${display}`,
                    );
                else
                    console.log(
                        `\u00A77[\u00A7aActivated\u00A77] \u00A7a${display}`,
                    );
            }

            obj[name] = true;
            return obj;
        });
    }
};

modtoggle.deactivate = (name, message = true) => {
    if (modtoggle.toggles[name]) {
        modtoggle.activeToggles(name, (obj) => {
            let display = modtoggle.toggles[name].displayName ?? name;
            if (obj[name]) {
                modtoggle.toggles[name].onDeactivate();
                console.log(
                    `\u00A77[\u00A7cDeactivated\u00A77] \u00A7c${display}`,
                );
                delete obj[name];
                return obj;
            } else
                console.log(
                    `\u00A77[\u00A7cUnchanged\u00A77] \u00A7c${display}`,
                );
        });
    } else console.error(`Toggle "${name}" not found`);
};

modtoggle.toggle = (name, message = true) => {
    if (modtoggle.toggles[name] == undefined) {
        console.error(`Toggle "${name}" not found`);
    } else {
        if (modtoggle.isActive(name)) modtoggle.deactivate(name, message);
        else modtoggle.activate(name, message);
    }
};

modtoggle.listToggles = (showHidden = false) => {
    let out = {};

    Object.keys(modtoggle.toggles)
        .filter((entry) => showHidden || !modtoggle.toggles[entry].hidden)
        .forEach((entry) => {
            if (modtoggle.activeToggles(entry)) out[entry] = true;
            else out[entry] = false;
        });

    return out;
};

modtoggle.printList = (page, showHidden = false) => {
    let pageSize = (modkeep.get("modtoggle/config") ?? {}).pageSize ?? 10;

    let fullList = Object.entries(modtoggle.listToggles(showHidden)).sort(
        ([n1], [n2]) => n1.localeCompare(n2),
    );
    let res = fullList.slice((page - 1) * pageSize, page * pageSize);
    let max = Math.ceil(fullList.length / pageSize);
    page = Math.min(page, max);

    if (res.length == 0) return console.log("\u00A76This page is empty.");

    let entries = res
        .map(([name, active]) => {
            let display = modtoggle.toggles[name].displayName ?? name;
            return active
                ? `\u00A77[\u00A7aEnabled\u00A77] \u00A7a${display}`
                : `\u00A77[\u00A7cDisabled\u00A77] \u00A7c${display}`;
        })
        .join("\n");
    console.log(
        `${entries}\n\u00A7bPage \u00A7e${page} \u00A7bof \u00A7e${max}`,
    );
};
