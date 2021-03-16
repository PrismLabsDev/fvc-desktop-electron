const Application = require("spectron").Application;
const electronPath = require("electron");
const path = require("path");

let app;

beforeAll(() => {
    app = new Application({
        path: electronPath,
        args: [path.join(__dirname, "../")]
    });
    return app.start();
});

afterAll(() => {
    if (app && app.isRunning()) {
        return app.stop();
    }
});

test("Displays App window", async () => {
    let windowCount = await app.client.getWindowCount();
    console.log(windowCount);
    expect(windowCount).toBe(1);
});

test("Header displays appropriate text", async () => {
    const headerElement = await app.client.$("h1");
    let headerText = await headerElement.getText();
    console.log(headerText);
    expect(headerText).toBe("Archive Record Information");
});