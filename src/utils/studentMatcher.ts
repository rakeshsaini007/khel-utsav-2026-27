import { StudentRegistration } from '../types';

/**
 * Normalize Hindi or English names by trimming, collapsing spaces,
 * and removing honorific prefixes like 'श्री', 'श्रीमती', 'Shri', 'Smt', 'Km', 'कुमारी'
 */
export function normalizeName(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/^(श्री|श्रीमती|shri|smt|mr|mr\.|mrs|mrs\.|km|km\.|कुमारी)\s+/i, '')
    .replace(/\s+/g, ' ');
}

/**
 * Normalize class representation (e.g., 'कक्षा 5' -> '5', 'कक्षा 6' -> '6', '5' -> '5')
 */
export function normalizeClass(cls?: string): string {
  if (!cls) return '';
  const digits = cls.replace(/[^0-9]/g, '');
  if (digits) return digits;
  return cls.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normalize UDISE code
 */
export function normalizeUdise(udise?: string): string {
  if (!udise) return '';
  return udise.replace(/^'/, '').replace(/[^0-9]/g, '').trim();
}

/**
 * Determine if two student records represent the EXACT SAME student
 * based on the 4 mandatory matching criteria:
 * 1. "विजेता का नाम" (studentName)
 * 2. "पिता का नाम" (fatherName)
 * 3. "कक्षा" (studentClass)
 * 4. "यू-डायस कोड" (udiseCode)
 */
export function isSameStudent(
  recordA?: Partial<StudentRegistration> | null,
  recordB?: Partial<StudentRegistration> | null
): boolean {
  if (!recordA || !recordB) return false;

  const nameA = normalizeName(recordA.studentName);
  const nameB = normalizeName(recordB.studentName);
  const fatherA = normalizeName(recordA.fatherName);
  const fatherB = normalizeName(recordB.fatherName);
  const classA = normalizeClass(recordA.studentClass);
  const classB = normalizeClass(recordB.studentClass);
  const udiseA = normalizeUdise(recordA.udiseCode);
  const udiseB = normalizeUdise(recordB.udiseCode);

  return Boolean(
    nameA && nameB && nameA === nameB &&
    fatherA && fatherB && fatherA === fatherB &&
    classA && classB && classA === classB &&
    udiseA && udiseB && udiseA === udiseB
  );
}

/**
 * Find an existing student record that matches the current student details
 */
export function findExistingStudentMatch(
  current: Partial<StudentRegistration>,
  records: StudentRegistration[]
): StudentRegistration | undefined {
  if (!records || records.length === 0) return undefined;
  if (!current.studentName || !current.fatherName || !current.studentClass || !current.udiseCode) {
    return undefined;
  }

  return records.find((r) => {
    // If editing the same row, skip self
    if (current.id && r.id && r.id === current.id) return false;
    if (current.rowNumber && r.rowNumber && r.rowNumber === current.rowNumber) return false;
    return isSameStudent(r, current);
  });
}

/**
 * The 9 specific auto-populated student fields required when matching:
 * 1. PEN
 * 2. छात्र/छात्रा का यूनिक आईडी नंबर
 * 3. प्रवेशांक
 * 4. जन्मतिथि
 * 5. आधार नंबर
 * 6. जन्म प्रमाण पत्र क्रमांक
 * 7. जन्म प्रमाण पत्र जारीकर्ता का पद नाम
 * 8. पहचान चिन्ह
 * 9. विजेता बच्चे के दांतों की संख्या
 */
export const AUTO_POPULATED_KEYS: (keyof StudentRegistration)[] = [
  'penNumber',
  'uniqueIdNumber',
  'admissionNumber',
  'dob',
  'aadhaarNumber',
  'birthCertNumber',
  'birthCertAuthority',
  'identificationMark',
  'teethCount',
  'parentNameHindi',
  'parentMobile',
  'headmasterName',
  'headmasterMobile'
];

/**
 * Convert any date string (ISO, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, Date object)
 * to standard HTML5 input value 'YYYY-MM-DD'
 */
export function normalizeDateToYYYYMMDD(val?: any): string {
  if (!val) return '';
  const str = String(val).trim();
  if (!str) return '';

  // 1. If already valid YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. If ISO string like 2015-04-12T00:00:00 or with timezone
  if (str.includes('T')) {
    const isoPart = str.split('T')[0];
    const m = isoPart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    }
  }

  // 3. If DD/MM/YYYY or D/M/YYYY
  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    // Check if first is year (YYYY/MM/DD)
    if (slashParts[0].trim().length === 4) {
      const y = slashParts[0].trim();
      const m = slashParts[1].trim().padStart(2, '0');
      const d = slashParts[2].trim().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // DD/MM/YYYY
    const d = slashParts[0].trim().padStart(2, '0');
    const m = slashParts[1].trim().padStart(2, '0');
    let y = slashParts[2].trim();
    if (y.length === 2) y = '20' + y;
    return `${y}-${m}-${d}`;
  }

  // 4. If DD-MM-YYYY
  const dashParts = str.split('-');
  if (dashParts.length === 3) {
    if (dashParts[0].length <= 2 && dashParts[2].length === 4) {
      const d = dashParts[0].trim().padStart(2, '0');
      const m = dashParts[1].trim().padStart(2, '0');
      const y = dashParts[2].trim();
      return `${y}-${m}-${d}`;
    }
  }

  // 5. Try parsing via new Date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
}

/**
 * Format date for user display in Indian format (DD/MM/YYYY)
 */
export function formatDisplayDate(val?: any): string {
  const norm = normalizeDateToYYYYMMDD(val);
  if (!norm || !norm.includes('-')) return val ? String(val) : '';
  const parts = norm.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return norm;
}
