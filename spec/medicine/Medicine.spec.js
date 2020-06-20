// imports
const using = require("jasmine-data-provider");

const FileReader = require("./../utils/FileReader");
const Constants = require("./../utils/Constants");
const Practo = require("./pages/Practo");
const DrugsUpdate = require("./pages/DrugsUpdate");
const Mims = require("./pages/Mims");
const Document = require("./../utils/Document");

// initialization
const fileReader = new FileReader();
const practo = new Practo(Constants.practoPageURL);
const drugsUpdate = new DrugsUpdate(Constants.drugsUpdatePageURL);
const mims = new Mims(Constants.mimsPageURL);
let isMimsLoggedIn = false;

// automation
describe("medicine information", () => {
  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  });

  // it("should load the CSV data properly", () => {
  //   fileReader.loadCSV("medicines.csv");
  //   browser.sleep(2000);
  // });

  // using(fileReader.loadCSV("medicines.csv"), function (drug) {
  using(["cardivas"], function (drug) {
    it(`should create a document for ${drug}`, async () => {
      // * set up the document
      const document = new Document();
      const index = fileReader.medicines.indexOf(drug);
      document.company = fileReader.companies[index];
      document.medicine = drug;

      // * return if medicine or company is not defined
      if (!document.medicine) return;

      // * get medicine information from Drugs Update
      // drugsUpdate.goToPage();
      // drugsUpdate.inputMedicineName(document.medicine);
      // const isDrugsUpdateSearchResultsPresent = await drugsUpdate.isSearchResultsPresent();
      // if (isDrugsUpdateSearchResultsPresent) {
      //   drugsUpdate.clickFirstSearchResult();
      //   const isDrugsUpdateTablePresent = await drugsUpdate.isTablePresent();
      //   if (isDrugsUpdateTablePresent) {
      //     const tableData = await drugsUpdate.getTable();
      //     document.cleanDrugsUpdateTableData(tableData);
      //     document.parseDrugsUpdateTableData();
      //     // console.log(
      //     //   "document.finalDrugsUpdateTableData",
      //     //   document.finalDrugsUpdateTableData
      //     // );
      //   }
      //   const isDrugsUpdateDescriptionPresent = await drugsUpdate.isDescriptionPresent();
      //   if (isDrugsUpdateDescriptionPresent) {
      //     const descriptionData = drugsUpdate.getDescription();
      //     document.drugsUpdateDescLineOne = await descriptionData.one;
      //     document.drugsUpdateDescLineTwo = await descriptionData.two;
      //     // console.log(
      //     //   "document.drugsUpdateDescLineOne",
      //     //   document.drugsUpdateDescLineOne
      //     // );
      //     // console.log(
      //     //   "document.drugsUpdateDescLineTwo",
      //     //   document.drugsUpdateDescLineTwo
      //     // );
      //   }
      // }

      // * get medicine information from MIMS
      mims.goToPage();
      if (!isMimsLoggedIn) {
        await mims.loginUser();
        isMimsLoggedIn = true;
      }
      mims.inputMedicineName(document.medicine);
      const isMimsSearchResultsPresent = await mims.isSearchResultsPresent();
      // console.log("isMimsSearchResultsPresent", isMimsSearchResultsPresent);
      if (isMimsSearchResultsPresent) {
        await mims.clickFirstSearchResult();
        const isHeadingsPresent = await mims.isHeadingsPresent();
        // console.log("isHeadingsPresent", isHeadingsPresent);
        if (isHeadingsPresent) {
          document.mimsHeadings = await mims.getHeadings();
          // console.log("document.mimsHeadings", document.mimsHeadings);
        }
        const isContentsPresent = await mims.isContentsPresent();
        // console.log("isContentsPresent", isContentsPresent);
        if (isContentsPresent) {
          document.mimsContents = await mims.getContents();
          // console.log("document.mimsContents", document.mimsContents);
        }
      }

      // * get medicine information from Practo
      practo.goToPage();
      practo.inputMedicineName(document.medicine);
      const isPractoSearchResultsPresent = await practo.isSearchResultsPresent();
      // console.log("isPractoSearchResultsPresent", isPractoSearchResultsPresent);
      if (isPractoSearchResultsPresent) {
        const isPractoFirstSearchResultPresent = await practo.isFirstSearchResultPresent();
        // console.log("isPractoFirstSearchResultPresent", isPractoFirstSearchResultPresent);
        if (isPractoFirstSearchResultPresent) {
          practo.clickFirstSearchResult();
          const isPractoDescriptionPresent = await practo.isDescriptionPresent();
          // console.log("isPractoDescriptionPresent", isPractoDescriptionPresent);
          if (isPractoDescriptionPresent) {
            document.practoDescription = await practo.getDescription();
            // console.log("document.practoDescription", document.practoDescription);
            document.practoReferenceUrl = await browser.getCurrentUrl();
            // console.log("document.practoReferenceUrl", document.practoReferenceUrl);
          }
        }
      }

      await document.createDocument();
    });
  });
});
