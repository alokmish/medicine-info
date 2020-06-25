const _ = require("lodash");

const Page = require("./../../utils/Page");
const Element = require("./../../utils/Element");
const { element } = require("protractor");

const username = "eikvkmlhytyjimxoih@awdrt.net";
const password = "Head2tail";

module.exports = class Mims extends Page {
  constructor(pageURL = undefined) {
    const ele = $("#searchHome.mims-search");
    super(ele, pageURL);
  }

  loginUser = async () => {
    const signInButton = new SignInButton();
    await signInButton.waitUntilPresent();
    signInButton.selector.click();
    const emailField = new EmailAddress();
    await emailField.waitUntilPresent();
    emailField.selector.click();
    emailField.selector.sendKeys(username);
    const passwordField = new Password();
    await passwordField.waitUntilPresent();
    passwordField.selector.click();
    passwordField.selector.sendKeys(password);
    const loginButton = new LoginButton();
    await loginButton.waitUntilPresent();
    loginButton.selector.click();
    await this.waitUntilPresent();
  };

  isSearchResultsPresent = () => {
    const results = new SearchResults();
    return results.waitUntilPresent();
  };

  clickFirstSearchResult = async () => {
    const results = new SearchResults();
    results.selector.click();
    const moreInfoLink = new MoreInfoLink();
    const isMoreInfoLinkPresent = await moreInfoLink.waitUntilPresent();
    if (isMoreInfoLinkPresent) {
      moreInfoLink.selector.click();
      const fullPrescribingInfoLink = new FullPrescribingInfoLink();
      const isFullPrescribingInfoLinkPresent = await fullPrescribingInfoLink.waitUntilPresent();
      // console.log(
      //   "isFullPrescribingInfoLinkPresent",
      //   isFullPrescribingInfoLinkPresent
      // );
      if (isFullPrescribingInfoLinkPresent) {
        fullPrescribingInfoLink.clickFullPrescribingInfoLink();
      }
    }
  };

  isHeadingsPresent = () => {
    const headings = new Headings();
    return headings.waitUntilPresent();
  };

  getHeadings = () => {
    const headings = new Headings();
    return headings.getHeadings();
  };

  isContentsPresent = () => {
    const contents = new Contents();
    return contents.waitUntilPresent();
  };

  getContents = () => {
    const contents = new Contents();
    return contents.getContents();
  };
};

class SignInButton extends Element {
  selector = $("#user_id.a_signin");
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

class SearchResults extends Element {
  selector = $$(".search-border-style").first().$$("a").first();
}

class MoreInfoLink extends Element {
  selector = $(".monograph-header").$$("h2").$$("a").first();
}

class FullPrescribingInfoLink extends Element {
  selector = $(".list-group.panel");

  clickFullPrescribingInfoLink = () => {
    this.selector.all(by.id("FullPrescribingInfo")).click();
  };
  // selector = element
  //   .all(by.tagName("a"))
  //   // .all(by.id("FullPrescribingInfo"))
  //   .first();
}

class Headings extends Element {
  selector = $$(".monograph-content").first();

  getHeadings = () => {
    return this.selector.all(by.css(".monograph-section-header")).map((el) => {
      return el.getText();
    });
  };
}

class Contents extends Element {
  selector = $$(".monograph-content").first();

  getContents = () => {
    return this.selector.all(by.css(".monograph-section-content")).map((el) => {
      return el.getText();
    });
  };
}
