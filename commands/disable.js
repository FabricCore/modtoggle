function main(ctx) {
    let name = StringArgumentType.getString(ctx, "name");
    modtoggle.deactivate(name.toLowerCase());
}
