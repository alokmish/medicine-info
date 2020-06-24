const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");
const { element } = require("protractor");

module.exports = class InformedHealth extends Page {
  constructor(pageURL = undefined) {
    const ele = element.all(by.id("querystring")).first();
    super(ele, pageURL);
  }

  isSearchResultsPresent = () => {
    const results = new SearchResults();
    return results.waitUntilPresent();
  };

  clickFirstSearchResult = () => {
    const results = new SearchResults();
    results.click();
  };

  isDescriptionPresent = () => {
    const descriptions = new Description();
    return descriptions.waitUntilPresent();
  };

  getDescriptionHeadings = () => {
    const descriptions = new Description();
    return descriptions.getDescriptionHeadings();
  };

  getDescriptionContents = () => {
    const descriptions = new Description();
    return descriptions.getDescriptionContents();
  };
};

class SearchResults extends Element {
  selector = element.all(by.css(".iq-link")).first();

  click = () => {
    this.selector.click();
  };
}

class Description extends Element {
  selector = $(".entry-content");

  getDescriptionHeadings = () => {
    const headings = this.selector.all(by.css("h2.acc-handle"));
    return headings.map((el) => {
      return el.all(by.tagName("span")).first().getText();
    });
  };

  getDescriptionContents = () => {
    const contents = this.selector.all(by.css(".acc-body"));
    return contents.map((el) => {
      return el.getText();
    });
  };
}
