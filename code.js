/**
 * Google Apps Script - Sports Registration & Sync Engine
 * फाइल नाम: code.js
 * 
 * न्याय पंचायत स्तरीय क्रीडा एवं शैक्षिक प्रतियोगिता विकास खण्ड स्वार रामपुर 2026 -27
 * खेलवार प्रथम स्थान प्राप्त करने वाले विजेता प्रतिभागियों की सूची (विकास खण्ड-स्वार)
 * 
 * शीट्स (Sheets):
 * 1. विजेता_प्रतिभागी_सूची (Main Registration Sheet)
 * 2. School_Master (UDISE School Master Data Sheet)
 * 
 * निर्देश (Instructions):
 * 1. Google Sheets खोलें (Open a Google Sheet at sheets.new)
 * 2. Extensions > Apps Script पर क्लिक करें (Extensions > Apps Script)
 * 3. इस फाइल (code.js) का पूरा कोड वहां paste करें और Save (Ctrl+S) करें
 * 4. ऊपर 'Deploy' > 'New deployment' चुनें
 * 5. Type में 'Web app' चुनें:
 *    - Description: "Sports Registration & School Master API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (महत्वपूर्ण: Anyone चुनें ताकि फॉर्म सबमिट हो सके)
 * 6. 'Deploy' पर क्लिक करें और प्राप्त "Web app URL" को कॉपी करें
 * 7. कॉपी किए गए URL को अपनी React ऐप की फाइल `src/config.ts` में paste करें।
 */

const SHEET_NAME = "विजेता_प्रतिभागी_सूची";
const SCHOOL_MASTER_SHEET = "School_Master";

/**
 * विजेता प्रतिभागी शीट और हेडर को तैयार करने का फ़ंक्शन
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    
    // शीर्षक ब्लॉक जोड़ें (25 columns A to Y)
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

    // कॉलम हेडर (PEN और यूनिक आईडी नंबर अलग-अलग)
    const headers = [
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

    sheet.getRange(3, 1, 1, headers.length)
      .setValues([headers])
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
 * School_Master शीट प्राप्त या स्वतः तैयार करने का फ़ंक्शन
 */
function getOrCreateSchoolMasterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SCHOOL_MASTER_SHEET);
  
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
 * GET Request Handler - डेटा खोजने, स्कूल मास्टर प्राप्त करने या चेक करने के लिए
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "getAll";

    // 1. Connection Ping Test
    if (action === "ping") {
      return createJsonResponse({ 
        status: "success", 
        message: "Google Apps Script connection is active with School_Master integration!" 
      });
    }

    // 2. Fetch all schools from "School_Master" sheet tab
    if (action === "getSchools" || action === "getSchoolMaster") {
      const masterSheet = getOrCreateSchoolMasterSheet();
      const data = masterSheet.getDataRange().getValues();
      const schools = [];
      
      // Determine header row index
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

    // 3. Lookup specific school by UDISE from "School_Master"
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

    // 4. Registration records query (विजेता_प्रतिभागी_सूची)
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
        penNumber: String(row[5] || ""),
        uniqueIdNumber: String(row[6] || ""),
        studentName: row[7],
        fatherName: row[8],
        studentClass: row[9],
        udiseCode: String(row[10] || ""),
        schoolName: row[11],
        nyayPanchayat: row[12],
        schoolType: row[13],
        admissionNumber: String(row[14] || ""),
        dob: row[15],
        aadhaarNumber: String(row[16] || ""),
        birthCertNumber: String(row[17] || ""),
        birthCertAuthority: row[18],
        identificationMark: row[19],
        teethCount: row[20],
        parentNameHindi: row[21],
        parentMobile: String(row[22] || ""),
        headmasterName: row[23],
        headmasterMobile: String(row[24] || "")
      };
      rows.push(record);
    }

    // Check if record exists for given UDISE + Game + Gender (+ PEN / Unique ID if provided)
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
 * POST Request Handler - नया डेटा सबमिट या मौजूदा डेटा अपडेट करने के लिए
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
        const rowUdise = String(r[10] || "").trim();
        const rowGame = String(r[2] || "").trim();
        const rowGender = String(r[4] || "").trim();
        const rowPen = String(r[5] || "").trim();
        const rowUnique = String(r[6] || "").trim();
        const rowStudentName = String(r[7] || "").trim();
        const rowAdmission = String(r[14] || "").trim();

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
      // मौजूदा रिकॉर्ड अपडेट करें (UPDATE)
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

      return createJsonResponse({
        status: "success",
        action: "updated",
        message: "छात्र/छात्रा का विवरण गूगल शीट में सफलतापूर्वक अपडेट हो गया! (Data updated successfully!)",
        rowNumber: targetRow,
        data: body
      });

    } else {
      // नया रिकॉर्ड दर्ज करें (INSERT)
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

      // Border and format
      const rowRange = sheet.getRange(insertedRow, 1, 1, newValues.length);
      rowRange.setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
      rowRange.setVerticalAlignment("middle");

      return createJsonResponse({
        status: "success",
        action: "saved",
        message: "छात्र/छात्रा का विवरण गूगल शीट में सफलतापूर्वक सुरक्षित हो गया! (Data saved successfully!)",
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
