function main(ctx) {
    let name = StringArgumentType.getString(ctx, "name");
    modtoggle.toggle(name);
}
