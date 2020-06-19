let SpecReporter = require("jasmine-spec-reporter").SpecReporter;

exports.config = {
  framework: "jasmine2",
  specs: ["spec/**/*.spec.js"],
  directConnect: true,
  chromeDriver: "node_modules/.bin/chromedriver",
  jasmineNodeOpts: {
    print: () => {},
  },
  onPrepare: () => {
    browser.ignoreSynchronization = true;

    jasmine.getEnv().addReporter(
      new SpecReporter({
        suite: {
          displayNumber: true, // display each suite number (hierarchical)
        },
        spec: {
          displaySuccessful: true,
          displayPending: true, // display each pending spec
          displayDuration: true, // display each spec duration
        },
        summary: {
          displaySuccessful: false, // display summary of all successes after execution
          displayFailed: true, // display summary of all failures after execution
          displayPending: false, // display summary of all pending specs after execution
          displayDuration: true,
        },
      })
    );
  },
  // Spec patterns are relative to the location of the spec file. They may
  // include glob patterns.
  suites: {
    medicine: "spec/medicine/*.spec.js",
  },
  capabilities: {
    browserName: "chrome",
    chromeOptions: {
      args: ["--test-type"],
      // args: ["--headless", "--disable-gpu", "--window-size=800x600"],
    },
  },
};
