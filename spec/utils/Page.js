const Element = require("./Element");

module.exports = class Page extends Element {
  referenceURL = "";
  pageURL = "";

  constructor(selector = undefined, pageURL = undefined) {
    super(selector);
    this.pageURL = pageURL;
  }

  goToPage = () => {
    this.checkPageURLExists();
    browser.manage().window().maximize();
    browser.get(this.pageURL);
    this.waitUntilDisplayed();
  };

  inputMedicineName = (medicine) => {
    this.waitUntilDisplayed();
    this.selector.clear();
    this.selector.click();
    this.selector.sendKeys(medicine);
    this.selector.sendKeys(protractor.Key.ENTER);
  };

  checkPageURLExists = () => {
    if (this.pageURL === "") {
      throw new TypeError(
        `Class '${this.constructor.name}' needs to implement "pageURL" to navigate to it.`
      );
    }
  };
};
