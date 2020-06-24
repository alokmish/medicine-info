const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");
const { element } = require("protractor");

module.exports = class Wikipedia extends Page {
  constructor(pageURL = undefined) {
    const ele = element.all(by.id("searchInput")).first();
    super(ele, pageURL);
  }

  isNoSearchResultsPresent = () => {
    const noSearchResults = new NoSearchResults();
    return noSearchResults.waitUntilPresent();
  };

  isDescriptionPresent = () => {
    const descriptions = new Description();
    return descriptions.waitUntilPresent();
  };

  getCompanyDescription = () => {
    const descriptions = new Description();
    return descriptions.getCompanyDescription();
  };
};

class NoSearchResults extends Element {
  selector = $(".mw-search-nonefound");
}

class Description extends Element {
  selector = $(".mw-parser-output");

  getCompanyDescription = () => {
    const description = this.selector.all(by.tagName("p"));
    return description.getText();
  };
}
