export interface StudentRegistration {
  id?: string;
  rowNumber?: number; // Google Sheet Row Number if existing
  timestamp?: string;
  srNo?: number | string;

  // School & Location Details (Auto-populated by UDISE)
  udiseCode: string;
  schoolName: string;
  nyayPanchayat: string;
  schoolType: 'PS' | 'UPS' | string;

  // Competition Details
  level: string; // "प्राथमिक स्तर" | "उच्च प्राथमिक स्तर"
  gameName: string;
  gender: string; // "बालक" | "बालिका"
  categorySheet?: 'PS BOYS' | 'PS GIRLS' | 'UPS BOYS' | 'UPS GIRLS' | string;

  // Student Details
  penNumber: string; // PEN (Permanent Education Number)
  uniqueIdNumber: string; // छात्र/छात्रा का यूनिक आईडी नंबर (Student Unique ID)
  studentName: string; // विजेता का नाम
  fatherName: string; // पिता का नाम
  studentClass: string; // कक्षा
  admissionNumber: string; // प्रवेशांक (SR No)
  dob: string; // जन्मतिथि (YYYY-MM-DD or DD/MM/YYYY)
  aadhaarNumber: string; // आधार नंबर (12 digits)

  // Verification & Certificate Details
  birthCertNumber: string; // जन्म प्रमाण पत्र क्रमांक
  birthCertAuthority: string; // जन्म प्रमाण पत्र जारीकर्ता का पद नाम (e.g., ग्राम विकास अधिकारी / नगर पालिका)
  identificationMark: string; // पहचान चिन्ह (e.g. तिल, कट का निशान)
  teethCount: string; // विजेता बच्चे के दांतों की संख्या

  // Parent & Teacher Contact Details
  parentNameHindi: string; // अभिभावक का नाम (हिन्दी में)
  parentMobile: string; // अभिभावक का नम्बर (जिस पर बात हो सके)
  headmasterName: string; // प्र० अ० का नाम (Headmaster Name)
  headmasterMobile: string; // प्र० अ० का विभागीय नम्बर
}

export type SubmissionStatus = 'idle' | 'checking' | 'saving' | 'success' | 'error';
