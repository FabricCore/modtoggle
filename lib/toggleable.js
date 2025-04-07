class Toggleable {
    constructor() {
        if (this.name == undefined) throw new Error("THIS MODULE HAS NO NAME");
    }

    onActivate() {}
    onDeactivate() {}
}
