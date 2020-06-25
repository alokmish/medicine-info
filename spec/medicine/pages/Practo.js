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
    return descriptions.getDescriptionText();
  };

  isDrugContainsPresent = () => {
    const drugContainsSpan = new DrugContainsSpan();
    const drugContainsAnchor = new DrugContainsAnchor();
    return (
      drugContainsSpan.waitUntilPresent() ||
      drugContainsAnchor.waitUntilPresent()
    );
  };

  getDrugContains = async () => {
    const drugContainsSpan = new DrugContainsSpan();
    const drugContainsAnchor = new DrugContainsAnchor();
    if (await drugContainsAnchor.waitUntilPresent()) {
      const anchorText = await drugContainsAnchor.getContainsAnchorText();
      return anchorText;
    }
    if (await drugContainsSpan.waitUntilPresent()) {
      const spanText = await drugContainsSpan.getContainsSpanText();
      return spanText;
    }
  };

  isDrugUsesPresent = () => {
    const drugUses = new DrugUses();
    return drugUses.waitUntilPresent();
  };

  getDrugUses = () => {
    const drugUses = new DrugUses();
    return drugUses.getDrugUsesText();
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

class DrugContainsSpan extends Element {
  selector = element.all(by.css("span.u-m-r--10.u-text--no-decoration")).last();

  getContainsSpanText = () => {
    return this.selector.getText();
  };
}

class DrugContainsAnchor extends Element {
  selector = element.all(by.css("a.u-m-r--10.u-text--no-decoration")).first();

  getContainsAnchorText = () => {
    return this.selector.getText();
  };
}

class DrugUses extends Element {
  selector = element(by.id("usage"));

  getDrugUsesText = () => {
    const usesEle = this.selector.all(by.css(".list__without-image-content"));
    return usesEle.map((el) => {
      return el.getText();
    });
  };
}
