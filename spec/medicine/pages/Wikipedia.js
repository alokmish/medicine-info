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

  isSearchPagePresent = () => {
    const searchPage = new SearchPage();
    return searchPage.waitUntilPresent();
  };

  isSearchResultsPresent = () => {
    const searchResults = new SearchResults();
    return searchResults.waitUntilPresent();
  };

  clickFirstSearchResult = () => {
    const searchResults = new SearchResults();
    searchResults.clickFirstSearchResult();
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

class SearchPage extends Element {
  selector = $("button.oo-ui-inputWidget-input.oo-ui-buttonElement-button");
}

class SearchResults extends Element {
  selector = element.all(by.css(".mw-search-result-heading")).first();

  clickFirstSearchResult = () => {
    this.selector.all(by.tagName("a")).click();
  };
}

class Description extends Element {
  selector = $(".mw-parser-output");

  getCompanyDescription = () => {
    const description = this.selector.all(by.tagName("p"));
    return description.getText();
  };
}
