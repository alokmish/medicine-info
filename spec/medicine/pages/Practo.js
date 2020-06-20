const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");
const { element } = require("protractor");

module.exports = class Practo extends Page {
  constructor(pageURL = undefined) {
    const element = $(
      ".u-p-l--40.text-steel.heading-elipson.u-shape-wid--full"
    );
    super(element, pageURL);
  }

  isSearchResultsPresent = () => {
    const results = new SearchResults();
    return results.waitUntilPresent();
  };

  isFirstSearchResultPresent = () => {
    const firstSearchResult = new FirstSearchResult();
    return firstSearchResult.waitUntilPresent();
  };

  clickFirstSearchResult = () => {
    const firstSearchResult = new FirstSearchResult();
    firstSearchResult.click();
  };

  isDescriptionPresent = () => {
    const descriptions = new Description();
    return descriptions.waitUntilPresent();
  };

  getDescription = () => {
    const descriptions = new Description();
    descriptions.waitUntilDisplayed();
    return descriptions.getDescriptionText();
  };
};

class SearchResults extends Element {
  selector = $(".search-bar__results");
}

class FirstSearchResult extends Element {
  selector = $(".search-bar__results")
    .$$(".search-bar__results-result")
    .first();

  click = () => {
    this.selector.click();
  };
}

class Description extends Element {
  selector = $("h2.heading-epsilon");

  getDescriptionText = () => {
    return this.selector.getText();
  };
}

class DrugUses extends Element {
  selector = $("#usage");
}
