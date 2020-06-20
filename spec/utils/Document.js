const fs = require("fs");
const docx = require("docx");
const _ = require("lodash");

module.exports = class Document {
  // document
  medicine = "";
  company = "";
  // Practo
  practoDescription = "";
  // Drugs Update
  drugsUpdateDescLineOne = "";
  drugsUpdateDescLineTwo = "";
  drugsUpdateCleanTableData = [];
  finalDrugsUpdateTableData = [];
  // MIMS
  mimsHeadings = [];
  mimsContents = [];
  // Brand Info
  brandInfoDescription = "This is a dummy brand info description.";
  // Disease Info
  diseaseInfoData = {
    diseaseOne: "This is the description for disease one",
    diseaseTwo: "This is the description for disease two",
  };

  // Create Document
  createDocument = async () => {
    const doc = new docx.Document();

    // * Summary
    const summaryParagraphs = this.getSummaryParagraphs();

    // * Drugs Update table
    let drugsUpdateDocTable = [];
    // if (
    //   this.finalDrugsUpdateTableData.length > 0
    // )
    //   drugsUpdateDocTable = this.getDrugsUpdateDocTable();

    // * Brand Info
    const brandInfoParagraphs = this.getBrandInfoParagraphs();

    // * Disease Info
    const diseaseInfoParagraphs = this.getDiseaseInfoParagraphs();

    // * MIMS Drug Detailed Description
    let detailedInfoParagraphs = [];
    if (this.mimsHeadings.length > 0 && this.mimsContents.length > 0)
      detailedInfoParagraphs = this.getDetailedInfoParagraphs();

    // * Final Sections
    const sectionParagraphs = summaryParagraphs.concat(
      drugsUpdateDocTable,
      brandInfoParagraphs,
      diseaseInfoParagraphs,
      detailedInfoParagraphs
    );
    doc.addSection({
      children: sectionParagraphs,
    });

    // Write document
    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(`documents/${this.medicine}.docx`, buffer);
    console.log(`Document created for ${this.medicine}`);
  };

  getSummaryParagraphs = () => {
    // * Practo summary
    let summaryTextRuns = [
      new docx.TextRun({
        text: "Brand Name: ",
        bold: true,
      }),
      new docx.TextRun({
        text: _.capitalize(this.medicine),
      }),
      new docx.TextRun({
        text: "Description: ",
        bold: true,
      }).break(),
      new docx.TextRun({
        text: this.practoDescription,
      }),
    ];
    // * Drugs Update summary
    // if (
    //   this.drugsUpdateDescLineOne !== "" &&
    //   this.drugsUpdateDescLineTwo !== ""
    // ) {
    //   const drugsUpdateTextRuns = this.getDrugsUpdateTextRuns();
    //   summaryTextRuns = summaryTextRuns.concat(drugsUpdateTextRuns);
    // }
    // * Disease Info summary
    const diseaseInfoTextRuns = [
      new docx.TextRun({
        text: "Uses: ",
        bold: true,
      }).break(),
      new docx.TextRun({
        text: Object.keys(this.diseaseInfoData).toString(),
      }),
    ];
    summaryTextRuns = summaryTextRuns.concat(diseaseInfoTextRuns);
    return [
      new docx.Paragraph({
        spacing: {
          after: 200,
        },
        children: summaryTextRuns,
      }),
    ];
  };

  // Drugs Update Methods
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

  getDrugsUpdateTextRuns = () => {
    return [
      new docx.TextRun({
        text: "Contains: ",
        bold: true,
      }).break(),
      new docx.TextRun({
        text: this.drugsUpdateDescLineOne,
      }),
      new docx.TextRun({
        text: "Category: ",
        bold: true,
      }).break(),
      new docx.TextRun({
        text: this.drugsUpdateDescLineTwo,
      }),
    ];
  };

  getDrugsUpdateDocTable = () => {
    let rows = [];
    for (let j = 0; j < this.finalDrugsUpdateTableData.length; j++) {
      rows.push(
        new docx.TableRow({
          children: [
            new docx.TableCell({
              width: {
                type: docx.WidthType.AUTO,
              },
              children: [
                new docx.Paragraph({
                  text: this.finalDrugsUpdateTableData[j][0],
                  heading: j === 0 ? docx.HeadingLevel.HEADING_4 : undefined,
                }),
              ],
              verticalAlign: docx.VerticalAlign.CENTER,
            }),
            new docx.TableCell({
              width: {
                type: docx.WidthType.AUTO,
              },
              children: [
                new docx.Paragraph({
                  text: this.finalDrugsUpdateTableData[j][1],
                  heading: j === 0 ? docx.HeadingLevel.HEADING_4 : undefined,
                }),
              ],
              verticalAlign: docx.VerticalAlign.CENTER,
            }),
            new docx.TableCell({
              width: {
                type: docx.WidthType.AUTO,
              },
              children: [
                new docx.Paragraph({
                  text: this.finalDrugsUpdateTableData[j][2],
                  heading: j === 0 ? docx.HeadingLevel.HEADING_4 : undefined,
                }),
              ],
              verticalAlign: docx.VerticalAlign.CENTER,
            }),
            new docx.TableCell({
              width: {
                type: docx.WidthType.AUTO,
              },
              children: [
                new docx.Paragraph({
                  text: this.finalDrugsUpdateTableData[j][3],
                  heading: j === 0 ? docx.HeadingLevel.HEADING_4 : undefined,
                }),
              ],
              verticalAlign: docx.VerticalAlign.CENTER,
            }),
          ],
        })
      );
    }
    return [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: "Dosage: ",
            bold: true,
          }),
        ],
      }),
      new docx.Table({
        rows,
      }),
    ];
  };

  getBrandInfoParagraphs = () => {
    return [
      new docx.Paragraph({
        spacing: {
          after: 200,
          before: 200,
        },
        children: [
          new docx.TextRun({
            text: "Brand Info",
            bold: true,
          }),
        ],
      }),
      new docx.Paragraph({
        spacing: {
          after: 200,
        },
        children: [
          new docx.TextRun({
            text: this.brandInfoDescription,
          }),
        ],
      }),
    ];
  };

  getDiseaseInfoParagraphs = () => {
    let paragraphs = [];
    for (let disease in this.diseaseInfoData) {
      if (this.diseaseInfoData.hasOwnProperty(disease)) {
        paragraphs.push(
          new docx.Paragraph({
            spacing: {
              after: 200,
            },
            children: [
              new docx.TextRun({
                text: disease,
                bold: true,
              }),
            ],
          }),
          new docx.Paragraph({
            spacing: {
              after: 200,
            },
            children: [
              new docx.TextRun({
                text: this.diseaseInfoData[disease],
              }),
            ],
          })
        );
      }
    }
    return paragraphs;
  };

  getDetailedInfoParagraphs = () => {
    let mimsDetailParagraphs = [];
    for (let i = 0; i < this.mimsHeadings.length; i++) {
      mimsDetailParagraphs.push(
        new docx.Paragraph({
          spacing: {
            after: 200,
          },
          children: [
            new docx.TextRun({
              text: this.mimsHeadings[i],
              bold: true,
            }),
          ],
        }),
        new docx.Paragraph({
          spacing: {
            after: 200,
          },
          children: [
            new docx.TextRun({
              text: this.mimsContents[i],
            }),
          ],
        })
      );
    }
    return mimsDetailParagraphs;
  };
};
