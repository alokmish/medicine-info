const fs = require("fs");
const docx = require("docx");

module.exports = class Document {
  medicine = "";
  company = "";
  practoDescription = "";
  drugsUpdateDescLineOne = "";
  drugsUpdateDescLineTwo = "";
  brandInfoDescription = "This is a dummy brand info description.";
  diseaseInfoData = {
    diseaseOne: "This is the description for disease one",
    diseaseTwo: "This is the description for disease two",
  };
  drugsUpdateCleanTableData = [];
  mimsCleanTableHeaders = [];
  mimsCleanTableValues = [];
  finalDrugsUpdateTableData = [];

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

  cleanMimsTableData = (rawData) => {
    let rawTableHeaders = [];
    let rawTableValues = [];
    rawData.forEach((dataItem, index) => {
      // * If array doesn't exist at index, create one
      if (!rawTableHeaders[index]) rawTableHeaders[index] = [];
      if (!rawTableValues[index]) rawTableValues[index] = [];
      // * If header exists, push it
      if (dataItem.header[0]) rawTableHeaders[index].push(dataItem.header[0]);
      // * If value exists, push it
      if (dataItem.value[0]) rawTableValues[index].push(dataItem.value[0]);
      // * The first index for secondaryValue is useless
      if (dataItem.secondaryValue[0]) {
        if (!dataItem.value[0] && !dataItem.header[0] && index !== 0) {
          rawTableValues[index].push(dataItem.secondaryValue[0]);
        }
      }
    });
    this.mimsCleanTableHeaders = rawTableHeaders.filter((el) => {
      return el.length !== 0;
    });
    this.mimsCleanTableValues = rawTableValues.filter((el) => {
      return el.length !== 0;
    });
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

  createDocument = () => {
    const doc = new docx.Document();
    const summaryParagraphs = this.getSummaryParagraphs();
    let drugsUpdateDocTable = [];
    if (
      this.drugsUpdateDescLineOne !== "" &&
      this.drugsUpdateDescLineTwo !== "" &&
      this.finalDrugsUpdateTableData.length > 0
    )
      drugsUpdateDocTable = this.getDrugsUpdateDocTable();
    const brandInfoParagraphs = this.getBrandInfoParagraphs();
    const diseaseInfoParagraphs = this.getDiseaseInfoParagraphs();
    let detailedInfoParagraphs = [];
    if (this.mimsCleanTableHeaders.length > 0)
      detailedInfoParagraphs = this.getDetailedInfoParagraphs();
    const sectionParagraphs = summaryParagraphs.concat(
      drugsUpdateDocTable,
      brandInfoParagraphs,
      diseaseInfoParagraphs,
      detailedInfoParagraphs
    );
    doc.addSection({
      children: sectionParagraphs,
    });
    docx.Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(`documents/${this.medicine}.docx`, buffer);
      console.log(`Document created for ${this.medicine}`);
    });
  };

  getSummaryParagraphs = () => {
    let textRuns = [
      new docx.TextRun({
        text: "Brand Name: ",
        bold: true,
      }),
      new docx.TextRun({
        text: this.medicine,
      }),
      new docx.TextRun({
        text: "Description: ",
        bold: true,
      }).break(),
      new docx.TextRun({
        text: this.practoDescription,
      }),
    ];
    if (
      this.drugsUpdateDescLineOne !== "" &&
      this.drugsUpdateDescLineTwo !== ""
    ) {
      const drugsUpdateTextRuns = this.getDrugsUpdateTextRuns();
      textRuns = textRuns.concat(drugsUpdateTextRuns);
    }
    const diseaseInfoTextRuns = [
      new docx.TextRun({
        text: "Uses: ",
        bold: true,
      }).break(),
      new docx.TextRun({
        text: Object.keys(this.diseaseInfoData).toString(),
      }),
    ];
    textRuns = textRuns.concat(diseaseInfoTextRuns);
    return [
      new docx.Paragraph({
        spacing: {
          after: 200,
        },
        children: textRuns,
      }),
    ];
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
    let paragraphs = [];
    for (let i = 0; i < this.mimsCleanTableHeaders.length; i++) {
      paragraphs.push(
        new docx.Paragraph({
          spacing: {
            after: 200,
          },
          children: [
            new docx.TextRun({
              text: this.mimsCleanTableHeaders[i][0],
              bold: true,
            }),
          ],
        })
      );
      const splitValues = this.mimsCleanTableValues[i][0].split("\n");
      let textRunArray = [];
      splitValues.forEach((value, index) => {
        if (index === 0) {
          textRunArray.push(
            new docx.TextRun({
              text: value,
            })
          );
        } else {
          textRunArray.push(
            new docx.TextRun({
              text: value,
            }).break()
          );
        }
      });
      paragraphs.push(
        new docx.Paragraph({
          spacing: {
            after: 200,
          },
          children: textRunArray,
        })
      );
    }
    return paragraphs;
  };
};
