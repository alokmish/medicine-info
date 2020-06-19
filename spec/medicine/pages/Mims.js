const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");

const username = "eikvkmlhytyjimxoih@awdrt.net";
const password = "Head2tail";

module.exports = class Mims extends Page {
  isSearchResults = true;

  constructor(pageURL = undefined) {
    const ele = $(".mainsearchinput.indexSearch");
    super(ele, pageURL);
  }

  loginUser = () => {
    const signInButton = new SignInButton();
    signInButton.waitUntilDisplayed();
    signInButton.selector.click();
    const emailField = new EmailAddress();
    emailField.waitUntilDisplayed();
    emailField.selector.click();
    emailField.selector.sendKeys(username);
    const passwordField = new Password();
    passwordField.waitUntilDisplayed();
    passwordField.selector.click();
    passwordField.selector.sendKeys(password);
    const loginButton = new LoginButton();
    loginButton.waitUntilDisplayed();
    loginButton.selector.click();
    const mainSearchInput = new MainSearch();
    mainSearchInput.waitUntilDisplayed();
  };

  clickFirstSearchResult = () => {
    const results = new SearchResults();
    const promise = new Promise((resolve) => {
      results.waitUntilDisplayedWithPromise().then((isElementPresent) => {
        if (isElementPresent) {
          results.selector.click();
          const moreInfoLink = new MoreInfoLink();
          moreInfoLink
            .waitUntilDisplayedWithPromise()
            .then((isMoreInfoLinkPresent) => {
              if (isMoreInfoLinkPresent) {
                moreInfoLink.selector.click();
                const dosageInfoLink = new DosageInfoLink();
                dosageInfoLink
                  .waitUntilDisplayedWithPromise()
                  .then((isDosageLinkPresent) => {
                    if (isDosageLinkPresent) {
                      dosageInfoLink.selector.click();
                      resolve(true);
                    }
                  });
              }
            });
        } else {
          this.isSearchResults = false;
          resolve(false);
        }
      });
    });
    return promise;
  };

  getTable = () => {
    browser.getCurrentUrl().then((url) => {
      this.referenceURL = url;
    });
    const table = new Table();
    table.waitUntilDisplayed();
    return table.getTableData();
  };
};

class SignInButton extends Element {
  selector = element(
    by.xpath("/html/body/div[1]/div/div[2]/div/div[2]/div[3]/div[2]/a/span")
  );
}

class EmailAddress extends Element {
  selector = $("#EmailAddress");
}

class Password extends Element {
  selector = $("#Password");
}

class LoginButton extends Element {
  selector = $("#btnSubmit");
}

class MainSearch extends Element {
  selector = $(".mainsearchinput.indexSearch");
}

class SearchResults extends Element {
  selector = element.all(by.css("a.mediumnormaltextblue")).first();
}

class MoreInfoLink extends Element {
  selector = element(
    by.partialLinkText(
      "prescribing information, dosage, adverse drug reactions"
    )
  );
}

class DosageInfoLink extends Element {
  selector = element(by.partialLinkText("Dosage by Indications"));
}

class Table extends Element {
  selector = element(
    by.xpath(
      "/html/body/div[2]/div[10]/div[2]/div[1]/div[3]/div/table[2]/tbody"
    )
  );

  getTableData = () => {
    let tableDivisions = this.selector.all(by.tagName("td"));
    return tableDivisions.map((div) => {
      let header = div.all(by.tagName("h2")).getText();
      let value = div.all(by.css("span[itemprop]")).getText();
      let secondaryValue = div.all(by.css("span.normaltext")).getText();
      return {
        header,
        value,
        secondaryValue,
      };
    });
  };
}
