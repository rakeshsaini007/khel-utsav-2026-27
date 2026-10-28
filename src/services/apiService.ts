import { GOOGLE_APPS_SCRIPT_URL } from '../config';
import { StudentRegistration } from '../types';
import { SchoolInfo, INITIAL_SCHOOLS } from '../data/schools';

const STORAGE_KEY = 'khel_utsav_registrations_v1';
const SCHOOLS_STORAGE_KEY = 'khel_utsav_schools_master_v1';

// Get local cached schools
export function getCachedSchools(): SchoolInfo[] {
  try {
    const raw = localStorage.getItem(SCHOOLS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return INITIAL_SCHOOLS;
  } catch {
    return INITIAL_SCHOOLS;
  }
}

// Save cached schools
export function saveCachedSchools(schools: SchoolInfo[]) {
  try {
    localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(schools));
  } catch (e) {
    console.error('Failed to cache schools', e);
  }
}

/**
 * Fetch schools live from Google Sheet tab "School_Master"
 */
export async function fetchSchoolsFromMasterSheet(): Promise<{ schools: SchoolInfo[]; isLive: boolean; total: number }> {
  if (!isPlaceholderUrl()) {
    try {
      const url = new URL(GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.set('action', 'getSchools');

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          saveCachedSchools(json.data);
          return { schools: json.data, isLive: true, total: json.data.length };
        }
      }
    } catch (err) {
      console.warn('Could not fetch School_Master from Google Sheet, falling back to cache:', err);
    }
  }

  const cached = getCachedSchools();
  return { schools: cached, isLive: false, total: cached.length };
}

// Get local cached records
export function getLocalRecords(): StudentRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save local cached records
export function saveLocalRecords(records: StudentRegistration[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Check whether the configured URL is still the default placeholder
export function isPlaceholderUrl(): boolean {
  return !GOOGLE_APPS_SCRIPT_URL || 
    GOOGLE_APPS_SCRIPT_URL.includes('ENTER_YOUR_DEPLOYMENT_ID_HERE') ||
    GOOGLE_APPS_SCRIPT_URL.includes('REPLACE_WITH_YOUR_DEPLOYED_APP_SCRIPT_URL');
}

/**
 * Check if a record already exists for the given criteria:
 * UDISE + Game + Gender + (PEN or Admission or Student Name)
 */
export async function checkExistingRecord(params: {
  udiseCode: string;
  gameName: string;
  gender: string;
  penNumber?: string;
  uniqueIdNumber?: string;
  admissionNumber?: string;
  studentName?: string;
}): Promise<{ found: boolean; record: StudentRegistration | null; source: 'gas' | 'local' }> {
  const { udiseCode, gameName, gender, penNumber, uniqueIdNumber, admissionNumber, studentName } = params;

  if (!udiseCode || !gameName || !gender) {
    return { found: false, record: null, source: 'local' };
  }

  // 1. If real Google Apps Script URL is configured, query the Google Sheet
  if (!isPlaceholderUrl()) {
    try {
      const url = new URL(GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.set('action', 'check');
      url.searchParams.set('udise', udiseCode);
      url.searchParams.set('game', gameName);
      url.searchParams.set('gender', gender);
      if (penNumber) url.searchParams.set('pen', penNumber);
      if (uniqueIdNumber) url.searchParams.set('uniqueId', uniqueIdNumber);

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'found' && json.data) {
          return { found: true, record: json.data, source: 'gas' };
        }
      }
    } catch (err) {
      console.warn('Google Apps Script check failed or CORS fallback, checking local store:', err);
    }
  }

  // 2. Local check
  const localList = getLocalRecords();
  const matched = localList.find(r => {
    const udiseMatch = r.udiseCode.trim().toLowerCase() === udiseCode.trim().toLowerCase();
    const gameMatch = r.gameName.trim().toLowerCase() === gameName.trim().toLowerCase();
    const genderMatch = r.gender.trim().toLowerCase() === gender.trim().toLowerCase();
    
    if (!udiseMatch || !gameMatch || !genderMatch) return false;

    // Check specific identifier if provided
    if (penNumber && r.penNumber && r.penNumber.trim() === penNumber.trim()) return true;
    if (uniqueIdNumber && r.uniqueIdNumber && r.uniqueIdNumber.trim() === uniqueIdNumber.trim()) return true;
    if (admissionNumber && r.admissionNumber && r.admissionNumber.trim() === admissionNumber.trim()) return true;
    if (studentName && r.studentName && r.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()) return true;

    // If only UDISE + Game + Gender are selected and there is a single participant registered for this game
    return true;
  });

  if (matched) {
    return { found: true, record: matched, source: 'local' };
  }

  return { found: false, record: null, source: 'local' };
}

/**
 * Fetch all registrations (from GAS or local)
 */
export async function fetchAllRecords(udiseFilter?: string): Promise<{ records: StudentRegistration[]; isLive: boolean }> {
  if (!isPlaceholderUrl()) {
    try {
      const url = new URL(GOOGLE_APPS_SCRIPT_URL);
      url.searchParams.set('action', 'getAll');
      if (udiseFilter) url.searchParams.set('udise', udiseFilter);

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          // Sync to local cache too
          saveLocalRecords(json.data);
          return { records: json.data, isLive: true };
        }
      }
    } catch (err) {
      console.warn('Could not fetch from GAS, using local records:', err);
    }
  }

  const local = getLocalRecords();
  const filtered = udiseFilter 
    ? local.filter(r => r.udiseCode.trim() === udiseFilter.trim())
    : local;

  return { records: filtered, isLive: false };
}

/**
 * Submit or Update record in Google Sheet via Apps Script
 */
export async function submitRegistration(data: StudentRegistration): Promise<{
  success: boolean;
  action: 'saved' | 'updated';
  message: string;
  record: StudentRegistration;
  isLive: boolean;
}> {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const preparedData: StudentRegistration = {
    ...data,
    timestamp: data.timestamp || timestamp,
    id: data.id || `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  };

  let isLive = false;
  let action: 'saved' | 'updated' = data.rowNumber ? 'updated' : 'saved';
  let message = '';

  // 1. Try real Google Apps Script POST
  if (!isPlaceholderUrl()) {
    try {
      // Use text/plain to avoid CORS preflight issues with Google Apps Script
      const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(preparedData),
      });

      if (res.ok) {
        const resText = await res.text();
        let json;
        try {
          json = JSON.parse(resText);
        } catch {
          json = { status: 'success' };
        }

        if (json.status === 'success') {
          isLive = true;
          action = json.action || action;
          message = json.message || (action === 'updated' 
            ? 'गूगल शीट में रिकॉर्ड सफलतापूर्वक अपडेट हो गया!' 
            : 'गूगल शीट में नया रिकॉर्ड सफलतापूर्वक दर्ज हो गया!');
          if (json.rowNumber) {
            preparedData.rowNumber = json.rowNumber;
          }
        }
      }
    } catch (err) {
      console.warn('GAS POST failed or blocked by CORS, falling back to local store:', err);
    }
  }

  // 2. Always maintain local store consistency
  const existingList = getLocalRecords();
  const existingIndex = existingList.findIndex(r => 
    (preparedData.id && r.id === preparedData.id) ||
    (preparedData.rowNumber && r.rowNumber === preparedData.rowNumber) ||
    (
      r.udiseCode.trim() === preparedData.udiseCode.trim() &&
      r.gameName.trim() === preparedData.gameName.trim() &&
      r.gender.trim() === preparedData.gender.trim() &&
      (
        (preparedData.penNumber && r.penNumber === preparedData.penNumber) ||
        (preparedData.admissionNumber && r.admissionNumber === preparedData.admissionNumber) ||
        (preparedData.studentName && r.studentName.toLowerCase() === preparedData.studentName.toLowerCase())
      )
    )
  );

  if (existingIndex >= 0) {
    action = 'updated';
    existingList[existingIndex] = {
      ...existingList[existingIndex],
      ...preparedData,
      rowNumber: existingList[existingIndex].rowNumber || (existingIndex + 4)
    };
    preparedData.rowNumber = existingList[existingIndex].rowNumber;
    if (!message) {
      message = 'छात्र/छात्रा का विवरण सफलतापूर्वक अपडेट कर दिया गया!';
    }
  } else {
    action = 'saved';
    preparedData.srNo = existingList.length + 1;
    preparedData.rowNumber = preparedData.rowNumber || (existingList.length + 4);
    existingList.unshift(preparedData);
    if (!message) {
      message = 'नया छात्र प्रतिभागी विवरण सफलतापूर्वक सुरक्षित हो गया!';
    }
  }

  saveLocalRecords(existingList);

  return {
    success: true,
    action,
    message,
    record: preparedData,
    isLive
  };
}

/**
 * Delete record
 */
export function deleteLocalRecord(idOrRowNumber: string | number) {
  const list = getLocalRecords();
  const updated = list.filter(r => r.id !== idOrRowNumber && r.rowNumber !== idOrRowNumber);
  saveLocalRecords(updated);
}
