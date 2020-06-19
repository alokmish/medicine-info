const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");

module.exports = class DrugsUpdate extends Page {
  isSearchResults = true;

  constructor(pageURL = undefined) {
    const ele = element.all(by.css("#headerSearchField.searchTextBox")).first();
    super(ele, pageURL);
  }

  clickFirstSearchResult = () => {
    const results = new SearchResults();
    const promise = new Promise((resolve) => {
      results.waitUntilDisplayedWithPromise().then((isElementPresent) => {
        if (isElementPresent) {
          results.click();
          resolve(true);
        } else {
          this.isSearchResults = false;
          resolve(false);
        }
      });
    });
    return promise;
  };

  getTable = () => {
    const table = new Table();
    const promise = new Promise((resolve, reject) => {
      table.waitUntilDisplayedWithPromise().then((isTablePresent) => {
        if (isTablePresent) {
          const data = table.getTableData();
          resolve(data);
        } else {
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
    const promise = new Promise((resolve, reject) => {
      descriptions
        .waitUntilDisplayedWithPromise()
        .then((isDescriptionPresent) => {
          if (isDescriptionPresent) {
            resolve({
              one: descriptions.getDescriptionText(),
              two: descriptions.getFullIntoText(),
            });
          } else {
            resolve(false);
          }
        });
    });
    return promise;
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
