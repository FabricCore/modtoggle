Command.register({
    package: "modules/toggle/commands",
    name: "toggle",

    execute: "listOne.js",

    args: {
        name: {
            type: StringArgumentType.string(),
            execute: "toggle.js",
        },
    },

    subcommands: {
        enable: {
            args: {
                name: {
                    type: StringArgumentType.string(),
                    execute: "enable.js",
                },
            },
        },
        disable: {
            args: {
                name: {
                    type: StringArgumentType.string(),
                    execute: "disable.js",
                },
            },
        },
        toggle: {
            args: {
                name: {
                    type: StringArgumentType.string(),
                    execute: "toggle.js",
                },
            },
        },
        list: {
            execute: "listOne.js",
            args: {
                page: {
                    type: IntegerArgumentType.integer(1),
                    execute: "list.js",
                },
            },

            subcommands: {
                hidden: {
                    execute: "listHiddenOne.js",
                    args: {
                        page: {
                            type: IntegerArgumentType.integer(1),
                            execute: "listHidden.js",
                        },
                    },
                },
            },

        },
    },
});
