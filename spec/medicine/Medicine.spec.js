const using = require("jasmine-data-provider");

const FileReader = require("./../utils/FileReader");
const Constants = require("./../utils/Constants");
const Practo = require("./pages/Practo");
const DrugsUpdate = require("./pages/DrugsUpdate");
const Mims = require("./pages/Mims");
const Document = require("./../utils/Document");

const fileReader = new FileReader();
const practo = new Practo(Constants.practoPageURL);
const drugsUpdate = new DrugsUpdate(Constants.drugsUpdatePageURL);
const mims = new Mims(Constants.mimsPageURL);
let document = null;
let isMimsLoggedIn = false;

describe("medicine information", () => {
  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  });

  // it("should load the CSV data properly", () => {
  //   fileReader.loadCSV("medicines.csv");
  //   browser.sleep(2000);
  // });

  using(fileReader.loadCSV("medicines.csv"), function (drug) {
    it(`should create a document for ${drug}`, () => {
      start(drug);
    });
  });
});

function start(drug) {
  document = null;
  initializeNewDocument(drug);
  if (document.medicine) getInfoFromPracto();
}

function initializeNewDocument(drug) {
  document = new Document();
  const index = fileReader.medicines.indexOf(drug);
  document.company = fileReader.companies[index];
  document.medicine = drug;
}

function getInfoFromPracto() {
  // * Practo
  practo.goToPage();
  practo.inputMedicineName(document.medicine, true);
  practo.clickFirstSearchResult().then((isSearchResults) => {
    if (isSearchResults) {
      practo.getDescription().then((desc) => {
        document.practoDescription = desc;
        // console.log("document.practoDescription", document.practoDescription);

        getInfoFromDrugUpdate();
      });
    } else {
      getInfoFromDrugUpdate();
    }
  });
}

function getInfoFromDrugUpdate() {
  // * Drugs Update
  drugsUpdate.goToPage();
  drugsUpdate.inputMedicineName(document.medicine);
  drugsUpdate.clickFirstSearchResult().then((isSearchResults) => {
    if (isSearchResults) {
      drugsUpdate.getTable().then((data) => {
        if (data && data.then) {
          data.then((values) => {
            document.cleanDrugsUpdateTableData(values);
            document.parseDrugsUpdateTableData();
            // console.log(
            //   "document.finalDrugsUpdateTableData",
            //   document.finalDrugsUpdateTableData
            // );
          });
          getInfoFromMims();
        } else if (data) {
          document.cleanDrugsUpdateTableData(data);
          document.parseDrugsUpdateTableData();
          getInfoFromMims();
        } else {
          getInfoFromMims();
        }
      });
      drugsUpdate.getDescription().then((data) => {
        if (data && data.one.then) {
          data.one.then((desc) => {
            document.drugsUpdateDescLineOne = desc;
            // console.log(
            //   "document.drugsUpdateDescLineOne",
            //   document.drugsUpdateDescLineOne
            // );
          });
        }
        if (data && data.two.then) {
          data.two.then((desc) => {
            document.drugsUpdateDescLineTwo = desc;
            // console.log(
            //   "document.drugsUpdateDescLineTwo",
            //   document.drugsUpdateDescLineTwo
            // );
          });
        }
        if (data && !data.one.then) {
          document.drugsUpdateDescLineOne = data.one;
        }
        if (data && !data.two.then) {
          document.drugsUpdateDescLineTwo = data.two;
        }
      });
    } else {
      getInfoFromMims();
    }
  });
}

function getInfoFromMims() {
  // * Mims
  mims.goToPage();
  if (!isMimsLoggedIn) {
    mims.loginUser();
    isMimsLoggedIn = true;
  }
  mims.inputMedicineName(document.medicine);
  mims.clickFirstSearchResult().then((isSearchResults) => {
    if (isSearchResults) {
      const mimsTableData = mims.getTable();
      mimsTableData.then((data) => {
        document.cleanMimsTableData(data);
        // console.log(
        //   "document.mimsCleanTableHeaders",
        //   document.mimsCleanTableHeaders
        // );
        // console.log(
        //   "document.mimsCleanTableValues",
        //   document.mimsCleanTableValues
        // );

        // * Create document once everything is ready
        document.createDocument();
        browser.sleep(2000);
      });
    } else {
      // * Create document once everything is ready
      document.createDocument();
      browser.sleep(2000);
    }
  });
}
