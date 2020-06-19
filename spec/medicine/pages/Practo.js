const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");

module.exports = class Practo extends Page {
  isSearchResults = true;

  constructor(pageURL = undefined) {
    const element = $(
      ".u-p-l--40.text-steel.heading-elipson.u-shape-wid--full"
    );
    super(element, pageURL);
  }

  clickFirstSearchResult = () => {
    const results = new SearchResults();
    const promise = new Promise((resolve) => {
      results.waitUntilDisplayedWithPromise().then((isElementPresent) => {
        if (isElementPresent) {
          results.clickFirstItem();
          resolve(true);
        } else {
          this.isSearchResults = false;
          resolve(false);
        }
      });
    });
    return promise;
  };

  getDescription = () => {
    browser.getCurrentUrl().then((url) => {
      this.referenceURL = url;
    });
    const descriptions = new Description();
    descriptions.waitUntilDisplayed();
    return descriptions.getDescriptionText();
  };
};

class SearchResults extends Element {
  selector = $(".search-bar__results");

  clickFirstItem = () => {
    const firstSearchResult = new FirstSearchResult();
    firstSearchResult.waitUntilDisplayed();
    firstSearchResult.click();
  };
}

class FirstSearchResult extends Element {
  selector = element(
    by.xpath("/html/body/div[2]/div[1]/div[2]/div/div[1]/div/div[2]/a[1]")
  );
  // selector = $(".search-bar__results-result");

  click = () => {
    this.selector.click();
  };
}

class Description extends Element {
  selector = element(
    by.xpath("/html/body/div[2]/div[2]/container/div[2]/div[2]/h2")
  );

  getDescriptionText = () => {
    return this.selector.getText();
  };
}
