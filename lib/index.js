if (typeof modtoggle === "undefined") {
    modtoggle = {};
    require("modules/toggle/lib/listeners.js");
    modtoggle.init();
} else {
    require("modules/toggle/lib/listeners.js");
}
