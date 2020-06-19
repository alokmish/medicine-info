const fs = require("fs");
const _ = require("lodash");

module.exports = class FileReader {
  medicines = [];
  companies = [];

  extractColumns = (data, column) => {
    // console.log("column", column);
    const headers = _.first(data);
    // console.log("headers", headers);
    // * Get indices of the required column
    const index = headers.indexOf(column);
    // console.log("index", index);
    // * Extract column which matches index
    const extracted = _.map(data, (row) => row[index]);
    extracted.shift();
    return extracted;
  };

  loadCSV = (filename) => {
    let data = fs.readFileSync(filename, {
      encoding: "utf-8",
    });
    // * Extracting row arrays
    data = data.split("\n").map((row) => row.split(","));
    // * Removing blank columns at the end of the row
    data = data.map((row) => {
      row = row.map((item) => item.trim());
      return _.dropRightWhile(row, (val) => val === "" || val === "\r");
    });

    this.medicines = this.extractColumns(data, "medicine");
    this.companies = this.extractColumns(data, "company");
    // console.log("medicines:", this.medicines);
    // console.log("companies:", this.companies);
    return this.medicines;
  };
};
