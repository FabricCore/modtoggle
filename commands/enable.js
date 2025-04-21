function main(ctx) {
    let name = StringArgumentType.getString(ctx, "name");
    modtoggle.activate(name.toLowerCase());
}
