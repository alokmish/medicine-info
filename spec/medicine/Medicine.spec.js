// imports
const using = require("jasmine-data-provider");

const FileReader = require("./../utils/FileReader");
const Constants = require("./../utils/Constants");
const Practo = require("./pages/Practo");
const DrugsUpdate = require("./pages/DrugsUpdate");
const Mims = require("./pages/Mims");
const InformedHealth = require("./pages/InformedHealth");
const Document = require("./../utils/Document");
const Wikipedia = require("./pages/Wikipedia");

// initialization
const fileReader = new FileReader();
const practo = new Practo(Constants.practoPageURL);
const drugsUpdate = new DrugsUpdate(Constants.drugsUpdatePageURL);
const mims = new Mims(Constants.mimsPageURL);
const informedHealth = new InformedHealth(Constants.informedHealthPageURL);
const wikipedia = new Wikipedia(Constants.wikipediaPageURL);
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
  using(["pipzo"], function (drug) {
    it(`should create a document for ${drug}`, async () => {
      // * set up the document
      const document = new Document();
      const index = fileReader.medicines.indexOf(drug);
      document.company = fileReader.companies[index];
      document.medicine = drug;
      document.company = "sun";

      // * return if medicine or company is not defined
      if (!document.medicine) return;

      // * get medicine information from Drugs Update
      drugsUpdate.goToPage();
      const isDrugsInfoLoaded = await drugsUpdate.isPageLoaded();
      if (isDrugsInfoLoaded) {
        drugsUpdate.inputMedicineName(document.medicine);
        const isDrugsUpdateSearchResultsPresent = await drugsUpdate.isSearchResultsPresent();
        if (isDrugsUpdateSearchResultsPresent) {
          drugsUpdate.clickFirstSearchResult();
          const isDrugsUpdateTablePresent = await drugsUpdate.isTablePresent();
          if (isDrugsUpdateTablePresent) {
            const tableData = await drugsUpdate.getTable();
            document.cleanDrugsUpdateTableData(tableData);
            document.parseDrugsUpdateTableData();
            // console.log(
            //   "document.finalDrugsUpdateTableData",
            //   document.finalDrugsUpdateTableData
            // );
          }
          const isDrugsUpdateDescriptionPresent = await drugsUpdate.isDescriptionPresent();
          if (isDrugsUpdateDescriptionPresent) {
            const descriptionData = drugsUpdate.getDescription();
            document.drugsUpdateDescLineOne = await descriptionData.one;
            document.drugsUpdateDescLineTwo = await descriptionData.two;
            // console.log(
            //   "document.drugsUpdateDescLineOne",
            //   document.drugsUpdateDescLineOne
            // );
            // console.log(
            //   "document.drugsUpdateDescLineTwo",
            //   document.drugsUpdateDescLineTwo
            // );
            document.processDrugsUpdateData();
          }
          const drugsUpdateReferenceUrl = await browser.getCurrentUrl();
          document.referenceUrls.push(drugsUpdateReferenceUrl);
        }
      }

      // * get medicine information from MIMS
      mims.goToPage();
      if (!isMimsLoggedIn) {
        await mims.loginUser();
        isMimsLoggedIn = true;
      }
      const isMimsLoaded = await mims.isPageLoaded();
      if (isMimsLoaded) {
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
            document.processMimsData();
          }
          const mimsReferenceUrl = await browser.getCurrentUrl();
          document.referenceUrls.push(mimsReferenceUrl);
        }
      }

      // * get medicine information from Practo
      practo.goToPage();
      const isPractoLoaded = await practo.isPageLoaded();
      if (isPractoLoaded) {
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
            }

            const isPractoDrugContainsPresent = await practo.isDrugContainsPresent();
            if (isPractoDrugContainsPresent) {
              document.practoContainsText = await practo.getDrugContains();
              console.log(
                "document.practoContainsText",
                document.practoContainsText
              );
            }

            const isPractoDrugUsesPresent = await practo.isDrugUsesPresent();
            if (isPractoDrugUsesPresent) {
              document.drugUses = await practo.getDrugUses();
              // console.log("document.drugUses", document.drugUses);
              document.processPractoData();
            }

            const practoReferenceUrl = await browser.getCurrentUrl();
            document.referenceUrls.push(practoReferenceUrl);
          }
        }
      }

      // * get medicine information from InformedHealth
      if (document.drugUses[0]) {
        informedHealth.goToPage();
        const isInformedHealthLoaded = await informedHealth.isPageLoaded();
        if (isInformedHealthLoaded) {
          informedHealth.inputMedicineName(`${document.drugUses[0]} overview`);
          const isInformedHealthResultsPresent = await informedHealth.isSearchResultsPresent();
          if (isInformedHealthResultsPresent) {
            informedHealth.clickFirstSearchResult();
            const isInformedHealthDescriptionPresent = await informedHealth.isDescriptionPresent();
            if (isInformedHealthDescriptionPresent) {
              const headings = await informedHealth.getDescriptionHeadings();
              document.informedHealthHeadings.push(headings);
              // console.log(
              //   "document.informedHealthHeadings",
              //   document.informedHealthHeadings
              // );
              const contents = await informedHealth.getDescriptionContents();
              document.informedHealthContents.push(contents);
              // console.log(
              //   "document.informedHealthContents",
              //   document.informedHealthContents
              // );
              const informedHealthReferenceUrl = await browser.getCurrentUrl();
              document.referenceUrls.push(informedHealthReferenceUrl);
            } else {
              document.informedHealthHeadings.push([null, null]);
              document.informedHealthContents.push([null, null]);
            }
          }
        }
      }
      if (document.drugUses[1]) {
        informedHealth.goToPage();
        const isInformedHealthLoaded = await informedHealth.isPageLoaded();
        if (isInformedHealthLoaded) {
          informedHealth.inputMedicineName(`${document.drugUses[1]} overview`);
          const isInformedHealthResultsPresent = await informedHealth.isSearchResultsPresent();
          if (isInformedHealthResultsPresent) {
            informedHealth.clickFirstSearchResult();
            const isInformedHealthDescriptionPresent = await informedHealth.isDescriptionPresent();
            if (isInformedHealthDescriptionPresent) {
              const headings = await informedHealth.getDescriptionHeadings();
              document.informedHealthHeadings.push(headings);
              // console.log(
              //   "document.informedHealthHeadings",
              //   document.informedHealthHeadings
              // );
              const contents = await informedHealth.getDescriptionContents();
              document.informedHealthContents.push(contents);
              // console.log(
              //   "document.informedHealthContents",
              //   document.informedHealthContents
              // );
              const informedHealthReferenceUrl = await browser.getCurrentUrl();
              document.referenceUrls.push(informedHealthReferenceUrl);
            } else {
              document.informedHealthHeadings.push([null, null]);
              document.informedHealthContents.push([null, null]);
            }
          }
        }
      }
      if (document.drugUses[2]) {
        informedHealth.goToPage();
        const isInformedHealthLoaded = await informedHealth.isPageLoaded();
        if (isInformedHealthLoaded) {
          informedHealth.inputMedicineName(`${document.drugUses[2]} overview`);
          const isInformedHealthResultsPresent = await informedHealth.isSearchResultsPresent();
          if (isInformedHealthResultsPresent) {
            informedHealth.clickFirstSearchResult();
            const isInformedHealthDescriptionPresent = await informedHealth.isDescriptionPresent();
            if (isInformedHealthDescriptionPresent) {
              const headings = await informedHealth.getDescriptionHeadings();
              document.informedHealthHeadings.push(headings);
              // console.log(
              //   "document.informedHealthHeadings",
              //   document.informedHealthHeadings
              // );
              const contents = await informedHealth.getDescriptionContents();
              document.informedHealthContents.push(contents);
              // console.log(
              //   "document.informedHealthContents",
              //   document.informedHealthContents
              // );
              const informedHealthReferenceUrl = await browser.getCurrentUrl();
              document.referenceUrls.push(informedHealthReferenceUrl);
            } else {
              document.informedHealthHeadings.push([null, null]);
              document.informedHealthContents.push([null, null]);
            }
          }
        }
      }
      document.processInformedHealthData();

      // * get company description from Wikipedia
      wikipedia.goToPage();
      const isWikipediaLoaded = wikipedia.isPageLoaded();
      if (isWikipediaLoaded) {
        wikipedia.inputMedicineName(`${document.company} pharmaceutical`);
        const isNoSearchResultsPresent = await wikipedia.isNoSearchResultsPresent();
        if (!isNoSearchResultsPresent) {
          const isCompanyDescriptionPresent = await wikipedia.isDescriptionPresent();
          if (isCompanyDescriptionPresent) {
            const companyDescriptionList = await wikipedia.getCompanyDescription();
            document.brandInfoDescription = companyDescriptionList[1].replace(
              / *\[[^\]]*]/g,
              ""
            );
            // console.log(
            //   "document.brandInfoDescription",
            //   document.brandInfoDescription
            // );
          }
        }
      }

      // * create the document
      await document.createDocument();
    });
  });
});
