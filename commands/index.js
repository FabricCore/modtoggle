Command.register({
    package: "modules/toggle/commands",
    name: "toggle",

    subcommands: {
        enable: {
            name: "enable",
            args: {
                name: {
                    type: StringArgumentType.word(),
                    execute: "enable.js",
                },
            },
        },
        disable: {
            name: "disable",
            args: {
                name: {
                    type: StringArgumentType.word(),
                    execute: "disable.js",
                },
            },
        },
    },
});
