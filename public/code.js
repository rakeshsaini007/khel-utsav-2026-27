/**
 * Google Apps Script - Sports Registration & Sync Engine
 * फाइल नाम: code.js
 * 
 * न्याय पंचायत स्तरीय क्रीडा एवं शैक्षिक प्रतियोगिता विकास खण्ड स्वार रामपुर 2026 -27
 * खेलवार प्रथम स्थान प्राप्त करने वाले विजेता प्रतिभागियों की सूची (विकास खण्ड-स्वार)
 * 
 * शीट्स (Sheets):
 * 1. विजेता_प्रतिभागी_सूची (Master Registration Sheet)
 * 2. School_Master (UDISE School Master Data Sheet)
 * 3. PS BOYS (प्राथमिक स्तर - बालक विजेता सूची)
 * 4. PS GIRLS (प्राथमिक स्तर - बालिका विजेता सूची)
 * 5. UPS BOYS (उच्च प्राथमिक स्तर - बालक विजेता सूची)
 * 6. UPS GIRLS (उच्च प्राथमिक स्तर - बालिका विजेता सूची)
 * 
 * ऑटो-कॉपी नियम (Auto-Copy Rules):
 * • स्तर: "प्राथमिक स्तर" (PS) + बालक (Boys) => स्वतः प्रतिलिपि (Copy) -> "PS BOYS"
 * • स्तर: "प्राथमिक स्तर" (PS) + बालिका (Girls) => स्वतः प्रतिलिपि (Copy) -> "PS GIRLS"
 * • स्तर: "उच्च प्राथमिक स्तर" (UPS) + बालक (Boys) => स्वतः प्रतिलिपि (Copy) -> "UPS BOYS"
 * • स्तर: "उच्च प्राथमिक स्तर" (UPS) + बालिका (Girls) => स्वतः प्रतिलिपि (Copy) -> "UPS GIRLS"
 * 
 * निर्देश (Instructions):
 * 1. Google Sheets खोलें (Open Google Sheet at sheets.new)
 * 2. Extensions > Apps Script पर क्लिक करें
 * 3. इस फाइल (code.js) का पूरा कोड वहां paste करें और Save (Ctrl+S) करें
 * 4. ऊपर 'Deploy' > 'New deployment' चुनें
 * 5. Type में 'Web app' चुनें:
 *    - Description: "Sports Registration & 4 Category Sheets Sync"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (महत्वपूर्ण: Anyone चुनें)
 * 6. 'Deploy' पर क्लिक करें और प्राप्त "Web app URL" को कॉपी करें
 * 7. कॉपी किए गए URL को अपनी React ऐप की फाइल `src/config.ts` में paste करें।
 */

const SHEET_NAME = "विजेता_प्रतिभागी_सूची";
const SCHOOL_MASTER_SHEET = "School_Master";

// 4 समर्पित श्रेणी शीट्स (4 Category Sheets)
const CATEGORY_SHEETS = {
  PS_BOYS: "PS BOYS",
  PS_GIRLS: "PS GIRLS",
  UPS_BOYS: "UPS BOYS",
  UPS_GIRLS: "UPS GIRLS"
};

// आधिकारिक 25 कॉलम हेडर (Official 25 Column Headers)
const TABLE_HEADERS = [
  "टाइमस्टैम्प",
  "क्रम संख्या",
  "खेल का नाम",
  "वर्ग / स्तर",
  "बालक / बालिका",
  "PEN",
  "छात्र/छात्रा का यूनिक आईडी नंबर",
  "विजेता का नाम",
  "पिता का नाम",
  "कक्षा",
  "यू-डायस कोड",
  "विद्यालय का नाम",
  "न्याय पंचायत",
  "विद्यालय प्रकार",
  "प्रवेशांक",
  "जन्मतिथि",
  "आधार नंबर",
  "जन्म प्रमाण पत्र क्रमांक",
  "जन्म प्रमाण पत्र जारीकर्ता का पद नाम",
  "पहचान चिन्ह",
  "विजेता बच्चे के दांतों की संख्या",
  "अभिभावक का नाम (हिन्दी में)",
  "अभिभावक का नम्बर (जिस पर बात हो सके)",
  "प्र० अ० का नाम",
  "प्र० अ० का विभागीय नम्बर"
];

/**
 * केस-इन्सेसिटिव शीट खोजने का हेल्पर (Case-insensitive sheet lookup)
 */
function findSheetCaseInsensitive(ss, sheetName) {
  const sheets = ss.getSheets();
  const targetNorm = sheetName.trim().toLowerCase().replace(/\s+/g, ' ');
  for (let i = 0; i < sheets.length; i++) {
    const nameNorm = sheets[i].getName().trim().toLowerCase().replace(/\s+/g, ' ');
    if (nameNorm === targetNorm) {
      return sheets[i];
    }
  }
  return null;
}

/**
 * स्तर और लिंग के आधार पर सही श्रेणी शीट का नाम ज्ञात करने का फ़ंक्शन
 * (Determine category sheet name based on Level & Gender)
 */
function getCategorySheetName(level, gender) {
  const lvl = String(level || "").trim().toLowerCase();
  const gnd = String(gender || "").trim().toLowerCase();

  // Primary Check
  const isPS = (lvl.includes("प्राथमिक") && !lvl.includes("उच्च")) || lvl === "ps";
  // Upper Primary Check
  const isUPS = lvl.includes("उच्च") || lvl.includes("ups");

  // Boy Check
  const isBoy = gnd.includes("बालक") || gnd.includes("boy") || gnd.includes("male") || gnd === "m";
  // Girl Check
  const isGirl = gnd.includes("बालिका") || gnd.includes("कन्या") || gnd.includes("girl") || gnd.includes("female") || gnd === "f";

  if (isPS && isBoy) return CATEGORY_SHEETS.PS_BOYS;
  if (isPS && isGirl) return CATEGORY_SHEETS.PS_GIRLS;
  if (isUPS && isBoy) return CATEGORY_SHEETS.UPS_BOYS;
  if (isUPS && isGirl) return CATEGORY_SHEETS.UPS_GIRLS;

  // Fallbacks based on available data
  if (isBoy) return isUPS ? CATEGORY_SHEETS.UPS_BOYS : CATEGORY_SHEETS.PS_BOYS;
  if (isGirl) return isUPS ? CATEGORY_SHEETS.UPS_GIRLS : CATEGORY_SHEETS.PS_GIRLS;

  return null;
}

/**
 * मुख्य विजेता प्रतिभागी शीट प्राप्त या तैयार करने का फ़ंक्शन
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = findSheetCaseInsensitive(ss, SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // यदि शीट खाली है तो हेडर व बैनर बनाएं
  if (sheet.getLastRow() < 3) {
    sheet.clear();

    // शीर्षक ब्लॉक (25 columns A to Y)
    sheet.getRange("A1:Y1").merge()
      .setValue("न्याय पंचायत स्तरीय क्रीडा एवं शैक्षिक प्रतियोगिता विकास खण्ड स्वार रामपुर 2026 -27")
      .setFontWeight("bold")
      .setFontSize(14)
      .setBackground("#1e3a8a")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
      
    sheet.getRange("A2:Y2").merge()
      .setValue("खेलवार प्रथम स्थान प्राप्त करने वाले विजेता प्रतिभागियों की सूची (विकास खण्ड-स्वार) | खण्ड शिक्षा अधिकारी : पी एल निरंकारी | ब्लॉक-स्वार")
      .setFontWeight("bold")
      .setFontSize(11)
      .setBackground("#dbeafe")
      .setFontColor("#1e3a8a")
      .setHorizontalAlignment("center");

    sheet.getRange(3, 1, 1, TABLE_HEADERS.length)
      .setValues([TABLE_HEADERS])
      .setFontWeight("bold")
      .setBackground("#facc15")
      .setFontColor("#000000")
      .setHorizontalAlignment("center")
      .setWrap(true);

    sheet.setFrozenRows(3);
    sheet.setRowHeight(3, 45);
  }

  return sheet;
}

/**
 * 4 श्रेणी शीट्स (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS) प्राप्त या तैयार करने का फ़ंक्शन
 */
function getOrCreateCategorySheet(targetSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = findSheetCaseInsensitive(ss, targetSheetName);

  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
  }

  // यदि श्रेणी शीट नई या खाली है तो मानक हेडर जोड़ें
  if (sheet.getLastRow() < 3) {
    let titleHindi = targetSheetName;
    let bgColor = "#1e3a8a";

    if (targetSheetName === CATEGORY_SHEETS.PS_BOYS) {
      titleHindi = "प्राथमिक स्तर - बालक वर्ग (PS BOYS)";
      bgColor = "#0369a1"; // Deep Sky
    } else if (targetSheetName === CATEGORY_SHEETS.PS_GIRLS) {
      titleHindi = "प्राथमिक स्तर - बालिका वर्ग (PS GIRLS)";
      bgColor = "#be185d"; // Deep Pink/Rose
    } else if (targetSheetName === CATEGORY_SHEETS.UPS_BOYS) {
      titleHindi = "उच्च प्राथमिक स्तर - बालक वर्ग (UPS BOYS)";
      bgColor = "#1d4ed8"; // Royal Blue
    } else if (targetSheetName === CATEGORY_SHEETS.UPS_GIRLS) {
      titleHindi = "उच्च प्राथमिक स्तर - बालिका वर्ग (UPS GIRLS)";
      bgColor = "#9333ea"; // Deep Purple
    }

    sheet.clear();

    // Row 1: Tournament Title
    sheet.getRange("A1:Y1").merge()
      .setValue("न्याय पंचायत स्तरीय क्रीडा एवं शैक्षिक प्रतियोगिता विकास खण्ड स्वार रामपुर 2026 -27")
      .setFontWeight("bold")
      .setFontSize(14)
      .setBackground(bgColor)
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");

    // Row 2: Category subtitle
    sheet.getRange("A2:Y2").merge()
      .setValue(`विजेता प्रतिभागियों की सूची | संवर्ग: ${titleHindi} | खण्ड शिक्षा अधिकारी : पी एल निरंकारी | ब्लॉक-स्वार`)
      .setFontWeight("bold")
      .setFontSize(11)
      .setBackground("#f1f5f9")
      .setFontColor(bgColor)
      .setHorizontalAlignment("center");

    // Row 3: Column Headers
    sheet.getRange(3, 1, 1, TABLE_HEADERS.length)
      .setValues([TABLE_HEADERS])
      .setFontWeight("bold")
      .setBackground("#facc15")
      .setFontColor("#000000")
      .setHorizontalAlignment("center")
      .setWrap(true);

    sheet.setFrozenRows(3);
    sheet.setRowHeight(3, 42);
  }

  return sheet;
}

/**
 * रिकॉर्ड को संबंधित श्रेणी शीट (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS) में ऑटो-कॉपी या अपडेट करें
 */
function syncRecordToCategorySheet(rowValues, level, gender, body) {
  try {
    const targetSheetName = getCategorySheetName(level, gender);
    if (!targetSheetName) {
      Logger.log("No matching category sheet found for level: " + level + ", gender: " + gender);
      return null;
    }

    const catSheet = getOrCreateCategorySheet(targetSheetName);
    const catData = catSheet.getDataRange().getValues();

    // हेडर रो इंडेक्स निर्धारित करें (डिफ़ॉल्ट रो 3, 0-indexed = 2)
    let headerRowIndex = 2;
    for (let i = 0; i < Math.min(5, catData.length); i++) {
      const rowStr = catData[i].join(" ").toLowerCase();
      if (rowStr.includes("pen") || rowStr.includes("विजेता") || rowStr.includes("खेल") || rowStr.includes("क्रम")) {
        headerRowIndex = i;
        break;
      }
    }

    const {
      penNumber = "",
      uniqueIdNumber = "",
      studentName = "",
      udiseCode = "",
      gameName = "",
      admissionNumber = ""
    } = body;

    let targetCatRow = null;

    // श्रेणी शीट में पूर्व दर्ज रिकॉर्ड का मिलान करें (Match existing record in category sheet)
    for (let i = headerRowIndex + 1; i < catData.length; i++) {
      const r = catData[i];
      const rGame = String(r[2] || "").trim().toLowerCase();
      const rPen = String(r[5] || "").replace(/^'/, "").trim();
      const rUnique = String(r[6] || "").replace(/^'/, "").trim();
      const rName = String(r[7] || "").trim().toLowerCase();
      const rUdise = String(r[10] || "").replace(/^'/, "").trim();
      const rAdmission = String(r[14] || "").replace(/^'/, "").trim();

      const penMatches = penNumber && rPen === String(penNumber).trim();
      const uniqueMatches = uniqueIdNumber && rUnique === String(uniqueIdNumber).trim();
      const admissionMatches = admissionNumber && udiseCode && 
                               rAdmission === String(admissionNumber).trim() && 
                               rUdise === String(udiseCode).trim();
      const nameGameMatches = studentName && gameName && udiseCode &&
                              rName === String(studentName).trim().toLowerCase() &&
                              rGame === String(gameName).trim().toLowerCase() &&
                              rUdise === String(udiseCode).trim();

      if (penMatches || uniqueMatches || admissionMatches || nameGameMatches) {
        targetCatRow = i + 1; // 1-indexed row number
        break;
      }
    }

    // श्रेणी शीट हेतु पंक्ति डेटा तैयार करें
    const catRowValues = [...rowValues];

    if (targetCatRow) {
      // यदि पहले से मौजूद है: मौजूदा क्रम संख्या सुरक्षित रखें (Preserve category sheet's existing Sr No)
      const existingSrNo = catSheet.getRange(targetCatRow, 2).getValue() || (targetCatRow - headerRowIndex);
      catRowValues[1] = existingSrNo;

      catSheet.getRange(targetCatRow, 1, 1, catRowValues.length).setValues([catRowValues]);
      return {
        action: "updated",
        sheet: targetSheetName,
        row: targetCatRow
      };
    } else {
      // नया रिकॉर्ड जोड़ें (INSERT new row in category sheet)
      const lastRow = catSheet.getLastRow();
      const newSrNo = Math.max(1, lastRow - headerRowIndex);
      catRowValues[1] = newSrNo;

      catSheet.appendRow(catRowValues);
      const insertedCatRow = catSheet.getLastRow();

      // बॉर्डर और एलाइनमेंट सेट करें
      const rowRange = catSheet.getRange(insertedCatRow, 1, 1, catRowValues.length);
      rowRange.setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
      rowRange.setVerticalAlignment("middle");

      return {
        action: "inserted",
        sheet: targetSheetName,
        row: insertedCatRow
      };
    }
  } catch (err) {
    Logger.log("Error in syncRecordToCategorySheet: " + err.toString());
    return {
      action: "error",
      error: err.toString()
    };
  }
}

/**
 * सभी पूर्व दर्ज प्रतिभागियों को मुख्य शीट से चारों शीट्स (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS)
 * में एक साथ कॉपी/सिंक करने हेतु यूटिलिटी फ़ंक्शन।
 * इसे Apps Script संपादक से 'syncAllToCategorySheets' चुनकर सीधे 'Run' भी कर सकते हैं।
 */
function syncAllToCategorySheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = findSheetCaseInsensitive(ss, SHEET_NAME);
  if (!mainSheet) {
    return "मुख्य शीट " + SHEET_NAME + " नहीं मिली!";
  }

  const data = mainSheet.getDataRange().getValues();
  let headerRowIndex = 2;
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const rowStr = data[i].join(" ").toLowerCase();
    if (rowStr.includes("pen") || rowStr.includes("विजेता") || rowStr.includes("खेल") || rowStr.includes("क्रम")) {
      headerRowIndex = i;
      break;
    }
  }

  let count = 0;
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row[1] && !row[2] && !row[7]) continue; // Blank row skip

    const level = String(row[3] || "");
    const gender = String(row[4] || "");
    const rowBody = {
      gameName: row[2],
      level: level,
      gender: gender,
      penNumber: String(row[5] || "").replace(/^'/, ""),
      uniqueIdNumber: String(row[6] || "").replace(/^'/, ""),
      studentName: row[7],
      fatherName: row[8],
      studentClass: row[9],
      udiseCode: String(row[10] || "").replace(/^'/, ""),
      schoolName: row[11],
      nyayPanchayat: row[12],
      schoolType: row[13],
      admissionNumber: String(row[14] || "").replace(/^'/, "")
    };

    const res = syncRecordToCategorySheet(row, level, gender, rowBody);
    if (res && (res.action === "inserted" || res.action === "updated")) {
      count++;
    }
  }

  const msg = `सफलतापूर्वक ${count} प्रतिभागियों को 4 शीट्स (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS) में सिंक कर दिया गया!`;
  Logger.log(msg);
  return msg;
}

/**
 * School_Master शीट प्राप्त या स्वतः तैयार करने का फ़ंक्शन
 */
function getOrCreateSchoolMasterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = findSheetCaseInsensitive(ss, SCHOOL_MASTER_SHEET);
  
  if (!sheet) {
    sheet = ss.insertSheet(SCHOOL_MASTER_SHEET);
    
    // School_Master Headers
    const headers = ["UDISE CODE", "School Name", "NYAY PANCHAYAT", "SCH TYPE"];
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight("bold")
      .setBackground("#1e3a8a")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
      
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 35);

    // Initial School Directory data from Swar Block (Rampur)
    const defaultSchools = [
      ["09050306501", "AAKA NAGAR (PS)", "SHADINAGAR HAJIRA", "PS"],
      ["09050306517", "AAKA NAGAR (UPS)", "SHADINAGAR HAJIRA", "UPS"],
      ["09050300801", "ABBAS NAGAR (PS)", "BADLI", "PS"],
      ["09050300802", "ABBAS NAGAR KOYLI (PS)", "MILAK TAJ KHAN", "PS"],
      ["09050300820", "ABBASPUR (PS)", "BADLI", "PS"],
      ["09050301001", "AGLAGA (UPS)", "DHANAURI", "UPS"],
      ["09050335001", "AHMAD NAGAR KALAN (PS)", "SHADINAGAR HAJIRA", "PS"],
      ["09050335002", "AHMAD NAGAR KALAN (UPS)", "SHADINAGAR HAJIRA", "UPS"],
      ["09050319101", "AJJUWALA (PS)", "SHADINAGAR HAJIRA", "PS"],
      ["09050313201", "AKBARABAD (PS)", "DADIYAL", "PS"],
      ["09050313202", "AKBARABAD (UPS)", "DADIYAL", "UPS"],
      ["09050302101", "ALINAGAR JANUBI (PS)", "BADLI", "PS"],
      ["09050302102", "ALINAGAR SHUMALI (UPS)", "BADLI", "UPS"],
      ["09050304501", "BADLI RURAL (PS)", "BADLI", "PS"],
      ["09050304502", "BADLI RURAL (UPS)", "BADLI", "UPS"],
      ["09050307801", "DADIYAL SHARQI (PS)", "DADIYAL", "PS"],
      ["09050307802", "DADIYAL GARBI (UPS)", "DADIYAL", "UPS"],
      ["09050309901", "MASWASI (PS NO.1)", "MASWASI", "PS"],
      ["09050309902", "MASWASI (UPS)", "MASWASI", "UPS"],
      ["09050311201", "MILAK TAJ KHAN (PS)", "MILAK TAJ KHAN", "PS"],
      ["09050311202", "MILAK TAJ KHAN (UPS)", "MILAK TAJ KHAN", "UPS"],
      ["09050314501", "SUAR DEHAT (PS)", "SUAR DEHAT", "PS"],
      ["09050314502", "SUAR DEHAT (UPS)", "SUAR DEHAT", "UPS"]
    ];

    sheet.getRange(2, 1, defaultSchools.length, 4).setValues(defaultSchools);
    sheet.autoResizeColumns(1, 4);
  }
  return sheet;
}

/**
 * GET Request Handler - डेटा खोजने, स्कूल मास्टर प्राप्त करने या 4 शीट्स सिंक करने के लिए
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "getAll";

    // 1. Connection Ping Test
    if (action === "ping") {
      return createJsonResponse({ 
        status: "success", 
        message: "Google Apps Script connection is active with 4 Category Sheets (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS) & School_Master!" 
      });
    }

    // 2. Trigger Full Resync to all 4 category sheets
    if (action === "syncCategories" || action === "syncAllCategories") {
      const msg = syncAllToCategorySheets();
      return createJsonResponse({
        status: "success",
        message: msg
      });
    }

    // 3. Fetch all schools from "School_Master" sheet tab
    if (action === "getSchools" || action === "getSchoolMaster") {
      const masterSheet = getOrCreateSchoolMasterSheet();
      const data = masterSheet.getDataRange().getValues();
      const schools = [];
      
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const rowStr = data[i].join(" ").toLowerCase();
        if (rowStr.includes("udise") || rowStr.includes("school")) {
          headerRowIndex = i;
          break;
        }
      }

      const headerRow = data[headerRowIndex].map(h => String(h).trim().toLowerCase());
      let udiseCol = headerRow.findIndex(h => h.includes("udise"));
      let nameCol = headerRow.findIndex(h => h.includes("school") || h.includes("name") || h.includes("विद्यालय"));
      let nyayCol = headerRow.findIndex(h => h.includes("nyay") || h.includes("panchayat") || h.includes("न्याय"));
      let typeCol = headerRow.findIndex(h => h.includes("type") || h.includes("sch type") || h.includes("प्रकार"));

      if (udiseCol === -1) udiseCol = 0;
      if (nameCol === -1) nameCol = 1;
      if (nyayCol === -1) nyayCol = 2;
      if (typeCol === -1) typeCol = 3;

      for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        const udise = String(row[udiseCol] || "").trim();
        const name = String(row[nameCol] || "").trim();
        if (!udise && !name) continue;

        schools.push({
          udiseCode: udise,
          schoolName: name,
          nyayPanchayat: String(row[nyayCol] || "").trim(),
          schoolType: String(row[typeCol] || "PS").trim().toUpperCase()
        });
      }

      return createJsonResponse({
        status: "success",
        total: schools.length,
        source: "School_Master",
        data: schools
      });
    }

    // 4. Lookup specific school by UDISE from "School_Master"
    if (action === "getSchool" || action === "checkSchool") {
      const udiseQuery = (e.parameter.udise || "").trim().toLowerCase();
      const masterSheet = getOrCreateSchoolMasterSheet();
      const data = masterSheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowUdise = String(row[0] || "").trim().toLowerCase();
        if (rowUdise === udiseQuery) {
          return createJsonResponse({
            status: "found",
            data: {
              udiseCode: String(row[0] || "").trim(),
              schoolName: String(row[1] || "").trim(),
              nyayPanchayat: String(row[2] || "").trim(),
              schoolType: String(row[3] || "PS").trim().toUpperCase()
            }
          });
        }
      }
      return createJsonResponse({ status: "not_found", message: "School not found in School_Master" });
    }

    // 5. Registration records query (विजेता_प्रतिभागी_सूची)
    const sheet = getOrCreateSheet();
    const udise = (e && e.parameter && e.parameter.udise ? e.parameter.udise : "").trim();
    const game = (e && e.parameter && e.parameter.game ? e.parameter.game : "").trim();
    const gender = (e && e.parameter && e.parameter.gender ? e.parameter.gender : "").trim();
    const pen = (e && e.parameter && e.parameter.pen ? e.parameter.pen : "").trim();
    const uniqueId = (e && e.parameter && e.parameter.uniqueId ? e.parameter.uniqueId : "").trim();

    const data = sheet.getDataRange().getValues();
    const rows = [];
    
    for (let i = 3; i < data.length; i++) {
      const row = data[i];
      if (!row[1] && !row[2] && !row[5] && !row[6] && !row[7]) continue; // Skip blank rows
      
      const record = {
        rowNumber: i + 1,
        timestamp: row[0],
        srNo: row[1],
        gameName: row[2],
        level: row[3],
        gender: row[4],
        penNumber: String(row[5] || "").replace(/^'/, ""),
        uniqueIdNumber: String(row[6] || "").replace(/^'/, ""),
        studentName: row[7],
        fatherName: row[8],
        studentClass: row[9],
        udiseCode: String(row[10] || "").replace(/^'/, ""),
        schoolName: row[11],
        nyayPanchayat: row[12],
        schoolType: row[13],
        admissionNumber: String(row[14] || "").replace(/^'/, ""),
        dob: row[15],
        aadhaarNumber: String(row[16] || "").replace(/^'/, ""),
        birthCertNumber: String(row[17] || ""),
        birthCertAuthority: row[18],
        identificationMark: row[19],
        teethCount: row[20],
        parentNameHindi: row[21],
        parentMobile: String(row[22] || "").replace(/^'/, ""),
        headmasterName: row[23],
        headmasterMobile: String(row[24] || "").replace(/^'/, "")
      };
      rows.push(record);
    }

    // Check if record exists for given UDISE + Game + Gender
    if (action === "check") {
      let matched = null;
      for (let r of rows) {
        const udiseMatch = r.udiseCode.toLowerCase() === udise.toLowerCase();
        const gameMatch = !game || r.gameName.toLowerCase() === game.toLowerCase();
        const genderMatch = !gender || r.gender.toLowerCase() === gender.toLowerCase();
        const penMatch = pen ? r.penNumber.toLowerCase() === pen.toLowerCase() : true;
        const uniqueMatch = uniqueId ? r.uniqueIdNumber.toLowerCase() === uniqueId.toLowerCase() : true;

        if (udiseMatch && gameMatch && genderMatch && penMatch && uniqueMatch) {
          matched = r;
          break;
        }
      }

      if (matched) {
        return createJsonResponse({ status: "found", data: matched });
      } else {
        return createJsonResponse({ status: "not_found", message: "No existing record found." });
      }
    }

    // Filter by UDISE if provided
    if (udise) {
      const filtered = rows.filter(r => r.udiseCode.toLowerCase() === udise.toLowerCase());
      return createJsonResponse({ status: "success", total: filtered.length, data: filtered });
    }

    // Return all registration records
    return createJsonResponse({ status: "success", total: rows.length, data: rows });

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * POST Request Handler - नया डेटा सबमिट या अपडेट करने एवं 4 शीट्स में स्वतः प्रतिलिपि भेजने के लिए
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    let body = {};

    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        body = e.parameter || {};
      }
    } else {
      body = (e && e.parameter) || {};
    }

    const {
      rowNumber,
      gameName = "",
      level = "",
      gender = "",
      penNumber = "",
      uniqueIdNumber = "",
      studentName = "",
      fatherName = "",
      studentClass = "",
      udiseCode = "",
      schoolName = "",
      nyayPanchayat = "",
      schoolType = "",
      admissionNumber = "",
      dob = "",
      aadhaarNumber = "",
      birthCertNumber = "",
      birthCertAuthority = "",
      identificationMark = "",
      teethCount = "",
      parentNameHindi = "",
      parentMobile = "",
      headmasterName = "",
      headmasterMobile = ""
    } = body;

    const data = sheet.getDataRange().getValues();
    let targetRow = null;

    // 1. अगर rowNumber दिया है, तो सीधे उसी रो को जांचें
    if (rowNumber && Number(rowNumber) > 3 && Number(rowNumber) <= data.length) {
      targetRow = Number(rowNumber);
    } else {
      // 2. अन्यथा UDISE + Game + Gender + PEN/Unique ID/Student Name से मिलान करें
      for (let i = 3; i < data.length; i++) {
        const r = data[i];
        const rowUdise = String(r[10] || "").replace(/^'/, "").trim();
        const rowGame = String(r[2] || "").trim();
        const rowGender = String(r[4] || "").trim();
        const rowPen = String(r[5] || "").replace(/^'/, "").trim();
        const rowUnique = String(r[6] || "").replace(/^'/, "").trim();
        const rowStudentName = String(r[7] || "").trim();
        const rowAdmission = String(r[14] || "").replace(/^'/, "").trim();

        if (
          rowUdise.toLowerCase() === String(udiseCode).trim().toLowerCase() &&
          rowGame.toLowerCase() === String(gameName).trim().toLowerCase() &&
          rowGender.toLowerCase() === String(gender).trim().toLowerCase()
        ) {
          if (
            (penNumber && rowPen === String(penNumber).trim()) ||
            (uniqueIdNumber && rowUnique === String(uniqueIdNumber).trim()) ||
            (admissionNumber && rowAdmission === String(admissionNumber).trim()) ||
            (studentName && rowStudentName.toLowerCase() === String(studentName).trim().toLowerCase())
          ) {
            targetRow = i + 1; // 1-indexed sheet row
            break;
          }
        }
      }
    }

    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "dd/MM/yyyy HH:mm:ss");

    if (targetRow) {
      // मौजूदा रिकॉर्ड अपडेट करें (UPDATE in Master Sheet)
      const existingSrNo = sheet.getRange(targetRow, 2).getValue() || (targetRow - 3);

      const updatedValues = [
        nowStr,
        existingSrNo,
        gameName,
        level,
        gender,
        "'" + penNumber,
        "'" + uniqueIdNumber,
        studentName,
        fatherName,
        studentClass,
        "'" + udiseCode,
        schoolName,
        nyayPanchayat,
        schoolType,
        "'" + admissionNumber,
        dob,
        "'" + aadhaarNumber,
        birthCertNumber,
        birthCertAuthority,
        identificationMark,
        teethCount,
        parentNameHindi,
        "'" + parentMobile,
        headmasterName,
        "'" + headmasterMobile
      ];

      sheet.getRange(targetRow, 1, 1, updatedValues.length).setValues([updatedValues]);

      // 4 समर्पित श्रेणी शीट्स (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS) में स्वतः प्रतिलिपि अपडेट करें
      const catSyncResult = syncRecordToCategorySheet(updatedValues, level, gender, body);
      const catSheetName = catSyncResult ? catSyncResult.sheet : getCategorySheetName(level, gender);

      return createJsonResponse({
        status: "success",
        action: "updated",
        categorySheet: catSheetName,
        message: `छात्र/छात्रा का विवरण मुख्य शीट तथा '${catSheetName}' शीट में सफलतापूर्वक अपडेट हो गया!`,
        rowNumber: targetRow,
        data: body
      });

    } else {
      // नया रिकॉर्ड दर्ज करें (INSERT in Master Sheet)
      const lastRow = sheet.getLastRow();
      const newSrNo = Math.max(1, lastRow - 2);

      const newValues = [
        nowStr,
        newSrNo,
        gameName,
        level,
        gender,
        "'" + penNumber,
        "'" + uniqueIdNumber,
        studentName,
        fatherName,
        studentClass,
        "'" + udiseCode,
        schoolName,
        nyayPanchayat,
        schoolType,
        "'" + admissionNumber,
        dob,
        "'" + aadhaarNumber,
        birthCertNumber,
        birthCertAuthority,
        identificationMark,
        teethCount,
        parentNameHindi,
        "'" + parentMobile,
        headmasterName,
        "'" + headmasterMobile
      ];

      sheet.appendRow(newValues);
      const insertedRow = sheet.getLastRow();

      // Border and format for Master Sheet row
      const rowRange = sheet.getRange(insertedRow, 1, 1, newValues.length);
      rowRange.setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
      rowRange.setVerticalAlignment("middle");

      // 4 समर्पित श्रेणी शीट्स (PS BOYS, PS GIRLS, UPS BOYS, UPS GIRLS) में स्वतः प्रतिलिपि भेजें
      const catSyncResult = syncRecordToCategorySheet(newValues, level, gender, body);
      const catSheetName = catSyncResult ? catSyncResult.sheet : getCategorySheetName(level, gender);

      return createJsonResponse({
        status: "success",
        action: "saved",
        categorySheet: catSheetName,
        message: `छात्र/छात्रा का विवरण मुख्य शीट तथा '${catSheetName}' शीट में स्वतः प्रतिलिपि सहित सुरक्षित हो गया!`,
        rowNumber: insertedRow,
        data: body
      });
    }

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: "त्रुटि: " + error.toString()
    });
  }
}

/**
 * CORS सुरक्षित JSON रिस्पॉन्स तैयार करने का हेल्पर
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
