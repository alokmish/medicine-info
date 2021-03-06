module.exports = class Element {
  selector = undefined;
  waitTime = 8000;

  constructor(selector = undefined) {
    this.selector = selector;
  }

  checkSelectorExist = () => {
    if (this.selector === undefined) {
      throw new TypeError(
        `Class '${this.constructor.name}' ` +
          "extends 'Element' possibly 'Page' Object Class and have to implement abstract property 'selector' " +
          "when 'isDisplayed' or 'waitUntilDisplayed' are used"
      );
    }
  };

  isDisplayed = () => {
    this.checkSelectorExist();
    return ExpectedConditions.visibilityOf(this.selector)();
  };

  waitUntilDisplayed = () => {
    this.checkSelectorExist();

    browser.wait(
      () => this.isDisplayed(),
      this.waitTime,
      `Failed while waiting for "${this.selector.locator()}" of Page Object Class '${
        this.constructor.name
      }' to display.`
    );
  };

  waitUntilPresent = () => {
    this.checkSelectorExist();
    const promise = new Promise((resolve) => {
      browser
        .wait(() => this.isDisplayed(), this.waitTime)
        .then(
          () => {
            // return true if element is present after timeout
            resolve(true);
          },
          () => {
            // return false if element isn't present after timeout
            resolve(false);
          }
        );
    });
    return promise;
  };
};
