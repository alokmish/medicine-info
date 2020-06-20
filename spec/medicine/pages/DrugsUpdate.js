const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");

module.exports = class DrugsUpdate extends Page {
  constructor(pageURL = undefined) {
    const ele = element.all(by.css("#headerSearchField.searchTextBox")).first();
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

  isTablePresent = () => {
    const table = new Table();
    return table.waitUntilPresent();
  };

  getTable = () => {
    const table = new Table();
    return table.getTableData();
  };

  isDescriptionPresent = () => {
    const descriptions = new Description();
    return descriptions.waitUntilPresent();
  };

  getDescription = () => {
    const descriptions = new Description();
    return {
      one: descriptions.getDescriptionText(),
      two: descriptions.getFullIntoText(),
    };
  };
};

class SearchResults extends Element {
  selector = element
    .all(
      by.xpath(
        "/html/body/div[3]/div[3]/div/div[2]/div[2]/div/div[2]/div/ul/li[1]/div/h3/a[2]"
      )
    )
    .first();

  click = () => {
    this.selector.click();
  };
}

class Table extends Element {
  selector = element.all(by.css(".brand_index_detail_list")).first();

  getTableData = () => {
    let cells = this.selector.all(by.css(".brand_index_list_tabel"));
    let colCount = 0;
    return cells.map((cell) => {
      let header = cell.all(by.tagName("h4")).getText();
      let value = cell.all(by.tagName("p")).getText();
      let returnVal = {
        colCount,
        header,
        value,
      };
      if (colCount === 3) {
        colCount = -1;
      }
      colCount += 1;
      return returnVal;
    });
  };
}

class Description extends Element {
  selector = element(
    by.xpath(
      "/html/body/div[3]/div[3]/div/div[2]/div[2]/div[2]/div[2]/div[2]/p[4]"
    )
  );
  description = element(
    by.xpath(
      "/html/body/div[3]/div[3]/div/div[2]/div[2]/div[2]/div[2]/div[2]/p[1]"
    )
  );

  getDescriptionText = () => {
    return this.description.getText();
  };

  getFullIntoText = () => {
    return this.selector.getText();
  };
}
