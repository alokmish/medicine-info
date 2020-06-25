const fs = require("fs");
const docx = require("docx");
const _ = require("lodash");

const Constants = require("./../utils/Constants");

module.exports = class Document {
  // Document
  medicine = "";
  company = "";
  // Practo
  practoContainsText = "";
  practoDescription = "";
  practoDocData = {
    isDataReady: false,
    containsText: "",
    brandInfoText: "",
    drugUsesText: "",
  };
  // Drugs Update
  drugsUpdateDescLineOne = "";
  drugsUpdateDescLineTwo = "";
  drugsUpdateCleanTableData = [];
  finalDrugsUpdateTableData = [];
  drugsUpdateDocData = {
    isDataReady: false,
    drugTypes: [],
    brandInfoText: "",
  };
  // MIMS
  mimsHeadings = [];
  mimsContents = [];
  mimsDocData = {
    isDataReady: false,
    categoryText: "",
  };
  // Brand Info
  brandInfoDescription = "";
  // Disease Info
  drugUses = [];
  informedHealthHeadings = [];
  informedHealthContents = [];
  informedHealthDocData = {
    isDataReady: false,
    diseaseInfo: {},
  };
  // Reference URL
  referenceUrls = [];

  cleanDrugsUpdateTableData = (rawData) => {
    let tableData = [];
    rawData.forEach((item) => {
      // * If array doesn't exist at index, create one
      if (!tableData[item.colCount]) tableData[item.colCount] = [];
      // * Push header if available
      if (item.header[0] !== "") tableData[item.colCount].push(item.header[0]);
      tableData[item.colCount].push(item.value[0]);
    });
    this.drugsUpdateCleanTableData = tableData;
  };

  parseDrugsUpdateTableData = () => {
    this.finalDrugsUpdateTableData = [];
    for (let i = 0; i < this.drugsUpdateCleanTableData[0].length; i++) {
      let row = [];
      this.drugsUpdateCleanTableData.forEach((item) => {
        row.push(item[i]);
      });
      this.finalDrugsUpdateTableData.push(row);
    }
  };

  getDrugTypes = () => {
    const drugTypes = [];
    for (let j = 1; j < this.finalDrugsUpdateTableData.length; j++) {
      const cleanDrugTypeValue = this.finalDrugsUpdateTableData[j][2]
        .toLowerCase()
        .replace(`${this.medicine} `, "");
      if (cleanDrugTypeValue.includes("tab")) {
        drugTypes.push("Tablet");
      } else if (cleanDrugTypeValue.includes("syr")) {
        drugTypes.push("Syrup");
      } else if (Constants.drugTypeMapping[cleanDrugTypeValue]) {
        drugTypes.push(Constants.drugTypeMapping[cleanDrugTypeValue]);
      } else {
        drugTypes.push(cleanDrugTypeValue);
      }
    }
    return _.uniq(drugTypes);
  };

  // * Drugs Update data processing
  processDrugsUpdateData = () => {
    const drugTypes = this.getDrugTypes();
    this.drugsUpdateDocData.drugTypes = drugTypes
      .toString()
      .replace(/,/g, ", ");
    this.drugsUpdateDocData.brandInfoText = `${this.drugsUpdateDescLineOne} ${this.drugsUpdateDescLineTwo}`;
    this.drugsUpdateDocData.isDataReady = true;
  };

  // * MIMS data processing
  processMimsData = () => {
    const index = this.mimsHeadings.indexOf("CIMS Class");
    this.mimsDocData.categoryText = this.mimsContents[index];
    this.mimsDocData.isDataReady = true;
  };

  // * Practo data processing
  processPractoData = () => {
    this.practoDocData.containsText = this.practoContainsText
      .replace(/ *\([^)]*\) */g, "")
      .replace(/\+/g, ",");
    this.practoDocData.brandInfoText = this.practoDescription;
    this.practoDocData.drugUsesText = this.drugUses
      .toString()
      .replace(/,/g, ", ");
    this.practoDocData.isDataReady = true;
  };

  // * InformedHealth data processing
  processInformedHealthData = () => {
    if (
      this.drugUses[0] &&
      this.informedHealthHeadings[0] &&
      this.informedHealthHeadings[0][0]
    ) {
      this.informedHealthDocData.diseaseInfo[this.drugUses[0]] = [];
      this.informedHealthDocData.diseaseInfo[this.drugUses[0]].push(
        this.informedHealthContents[0][0],
        this.informedHealthContents[0][1]
      );
    }
    if (
      this.drugUses[1] &&
      this.informedHealthHeadings[1] &&
      this.informedHealthHeadings[1][0]
    ) {
      this.informedHealthDocData.diseaseInfo[this.drugUses[1]] = [];
      this.informedHealthDocData.diseaseInfo[this.drugUses[1]].push(
        this.informedHealthContents[1][0],
        this.informedHealthContents[1][1]
      );
    }
    if (
      this.drugUses[2] &&
      this.informedHealthHeadings[2] &&
      this.informedHealthHeadings[2][0]
    ) {
      this.informedHealthDocData.diseaseInfo[this.drugUses[2]] = [];
      this.informedHealthDocData.diseaseInfo[this.drugUses[2]].push(
        this.informedHealthContents[2][0],
        this.informedHealthContents[2][1]
      );
    }
    if (_.keys(this.informedHealthDocData.diseaseInfo).length > 0)
      this.informedHealthDocData.isDataReady = true;
  };

  // * Create Document
  createDocument = async () => {
    const doc = new docx.Document({
      creator: "Anjali Mishra",
      title: this.medicine,
      description: `This is a document about the drug, ${this.medicine}`,
    });

    // * Summary
    // console.log("Getting summary");
    const summaryParagraphs = this.getSummaryParagraphs();

    // * Brand Info
    // console.log("Getting brand info");
    const brandInfoParagraphs = this.getBrandInfoParagraphs();

    // * Disease Info
    // console.log("Getting disease info");
    const diseaseInfoParagraphs = this.getDiseaseInfoParagraphs();

    // * Drug Detailed Info
    // console.log("Getting mims details");
    let detailedInfoParagraphs = [];
    if (this.mimsHeadings.length > 0 && this.mimsContents.length > 0)
      detailedInfoParagraphs = this.getDetailedInfoParagraphs();

    // * Reference URLs
    let referencesInfoParagraphs = [];
    if (this.referenceUrls.length > 0)
      referencesInfoParagraphs = this.getReferencesInfoParagraphs();

    // * Final Sections
    const documentParagraphs = summaryParagraphs.concat(
      brandInfoParagraphs,
      diseaseInfoParagraphs,
      detailedInfoParagraphs,
      referencesInfoParagraphs
    );
    doc.addSection({
      children: documentParagraphs,
    });

    // * Write document
    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(`documents/${this.medicine}.docx`, buffer);
    console.log(`Document created for ${this.medicine}`);
  };

  getTextValueToUse = (textValue, isDataReady, emptyValueToUse) => {
    if (!isDataReady) return emptyValueToUse;
    return textValue ? textValue : emptyValueToUse;
  };

  getSummaryParagraphs = () => {
    return [
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: "Name of Brand: ",
            font: "Calibri",
            color: "7F7F80",
            size: 24,
            bold: true,
            heading: docx.HeadingLevel.HEADING_4,
          }),
          new docx.TextRun({
            text: _.capitalize(this.medicine),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: "Dosage: ",
            font: "Calibri",
            color: "7F7F80",
            size: 24,
            bold: true,
            heading: docx.HeadingLevel.HEADING_4,
          }),
          new docx.TextRun({
            text: this.getTextValueToUse(
              this.drugsUpdateDocData.drugTypes,
              this.drugsUpdateDocData.isDataReady,
              "----"
            ),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: "Contains: ",
            font: "Calibri",
            color: "7F7F80",
            size: 24,
            bold: true,
            heading: docx.HeadingLevel.HEADING_4,
          }),
          new docx.TextRun({
            text: this.getTextValueToUse(
              this.practoDocData.containsText,
              this.practoDocData.isDataReady,
              "----"
            ),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: "Category: ",
            font: "Calibri",
            color: "7F7F80",
            size: 24,
            bold: true,
            heading: docx.HeadingLevel.HEADING_4,
          }),
          new docx.TextRun({
            text: this.getTextValueToUse(
              this.mimsDocData.categoryText,
              this.mimsDocData.isDataReady,
              "----"
            ),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 300,
        },
        children: [
          new docx.TextRun({
            text: "Uses: ",
            font: "Calibri",
            color: "7F7F80",
            size: 24,
            bold: true,
            heading: docx.HeadingLevel.HEADING_4,
          }),
          new docx.TextRun({
            text: this.getTextValueToUse(
              this.practoDocData.drugUsesText,
              this.practoDocData.isDataReady,
              "----"
            ),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
    ];
  };

  getBrandInfoParagraphs = () => {
    return [
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: "Brand Info",
            font: "Calibri",
            color: "7F7F80",
            size: 24,
            bold: true,
            heading: docx.HeadingLevel.HEADING_4,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: this.getTextValueToUse(
              this.practoDocData.brandInfoText,
              this.practoDocData.isDataReady,
              ""
            ),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: this.getTextValueToUse(
              this.drugsUpdateDocData.brandInfoText,
              this.drugsUpdateDocData.isDataReady,
              ""
            ),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 300,
        },
        children: [
          new docx.TextRun({
            text: this.getTextValueToUse(
              this.brandInfoDescription,
              true,
              "----"
            ),
            font: "Calibri",
            color: "7F7F80",
            size: 20,
          }),
        ],
      }),
    ];
  };

  getDiseaseInfoParagraphs = () => {
    // Return if data is not available
    if (!this.informedHealthDocData.isDataReady) return [];
    // Process paragraphs and return them
    const diseaseInfoParagraphs = [];
    // console.log(
    //   "this.informedHealthDocData.diseaseInfo",
    //   this.informedHealthDocData.diseaseInfo
    // );
    if (_.keys(this.informedHealthDocData.diseaseInfo).length > 0)
      diseaseInfoParagraphs.push(
        new docx.Paragraph({
          spacing: {
            after: 150,
          },
          children: [
            new docx.TextRun({
              text: "Disease Info",
              font: "Calibri",
              color: "7F7F80",
              size: 24,
              bold: true,
              heading: docx.HeadingLevel.HEADING_4,
            }),
          ],
        })
      );
    _.keys(this.informedHealthDocData.diseaseInfo).forEach((disease) => {
      diseaseInfoParagraphs.push(
        new docx.Paragraph({
          spacing: {
            after: 150,
          },
          children: [
            new docx.TextRun({
              text: disease,
              font: "Calibri",
              color: "7F7F80",
              size: 24,
              bold: true,
              heading: docx.HeadingLevel.HEADING_4,
            }),
          ],
        }),
        new docx.Paragraph({
          spacing: {
            after: 150,
          },
          children: [
            new docx.TextRun({
              text: this.informedHealthDocData.diseaseInfo[disease][0],
              font: "Calibri",
              color: "7F7F80",
              size: 20,
            }),
          ],
        }),
        new docx.Paragraph({
          spacing: {
            after: 300,
          },
          children: [
            new docx.TextRun({
              text: this.informedHealthDocData.diseaseInfo[disease][1],
              font: "Calibri",
              color: "7F7F80",
              size: 20,
            }),
          ],
        })
      );
    });
    return diseaseInfoParagraphs;
  };

  getDetailedInfoParagraphs = () => {
    let detailedInfoParagraphs = [];
    for (let i = 0; i < Constants.mimsOrderedHeadings.length; i++) {
      detailedInfoParagraphs.push(
        new docx.Paragraph({
          // ! Commenting this as a new line is added, not sure why
          // spacing: {
          //   after: 150,
          // },
          children: [
            new docx.TextRun({
              text: Constants.mimsOrderedHeadings[i],
              font: "Calibri",
              color: "7F7F80",
              size: 24,
              bold: true,
              heading: docx.HeadingLevel.HEADING_4,
            }),
          ],
        })
      );
      const index = this.mimsHeadings.indexOf(Constants.mimsOrderedHeadings[i]);
      if (index !== -1) {
        const textRunArray = [];
        const splitValues = this.mimsContents[index].split("\n");
        splitValues.forEach((textVal) => {
          textRunArray.push(
            new docx.TextRun({
              text: textVal.replace(/w\//g, "with"),
              font: "Calibri",
              color: "7F7F80",
              size: 20,
            }).break()
          );
        });
        detailedInfoParagraphs.push(
          new docx.Paragraph({
            spacing: {
              after: 300,
            },
            children: textRunArray,
          })
        );
      } else {
        detailedInfoParagraphs.push(
          new docx.Paragraph({
            spacing: {
              after: 300,
            },
            children: [
              new docx.TextRun({
                text: "----",
                font: "Calibri",
                color: "7F7F80",
                size: 20,
              }),
            ],
          })
        );
      }
    }

    for (let i = 0; i < this.mimsHeadings.length; i++) {}
    return detailedInfoParagraphs;
  };

  getReferencesInfoParagraphs = () => {
    let referencesInfoParagraphs = [
      new docx.Paragraph({
        spacing: {
          after: 150,
        },
        children: [
          new docx.TextRun({
            text: "References",
            font: "Calibri",
            color: "7F7F80",
            size: 24,
            bold: true,
            heading: docx.HeadingLevel.HEADING_4,
          }),
        ],
      }),
    ];
    for (let i = 0; i < this.referenceUrls.length; i++) {
      referencesInfoParagraphs.push(
        new docx.Paragraph({
          spacing: {
            after: 150,
          },
          children: [
            new docx.TextRun({
              text: this.referenceUrls[i],
              font: "Calibri",
              color: "7F7F80",
              size: 20,
            }),
          ],
        })
      );
    }
    return referencesInfoParagraphs;
  };
};
