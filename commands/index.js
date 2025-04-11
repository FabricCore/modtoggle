Command.register({
    package: "modules/toggle/commands",
    name: "toggle",

    args: {
        name: {
            type: StringArgumentType.string(),
            execute: "toggle.js",
        },
    },

    subcommands: {
        enable: {
            name: "enable",
            args: {
                name: {
                    type: StringArgumentType.string(),
                    execute: "enable.js",
                },
            },
        },
        disable: {
            name: "disable",
            args: {
                name: {
                    type: StringArgumentType.string(),
                    execute: "disable.js",
                },
            },
        },
        toggle: {
            name: "toggle",
            args: {
                name: {
                    type: StringArgumentType.string(),
                    execute: "toggle.js",
                },
            },
        },
        list: {
            name: "list",
            execute: "listOne.js",
            args: {
                page: {
                    type: IntegerArgumentType.integer(1),
                    execute: "list.js",
                },
            },
        },
    },
});
