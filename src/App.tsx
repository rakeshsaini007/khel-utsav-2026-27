/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SchoolSearchCard } from './components/SchoolSearchCard';
import { GameAndGenderSelector } from './components/GameAndGenderSelector';
import { StudentFormCard } from './components/StudentFormCard';
import { SheetRegisterView } from './components/SheetRegisterView';
import { AlertModal } from './components/AlertModal';
import { GasSetupModal } from './components/GasSetupModal';
import { StudentRegistration } from './types';
import { INITIAL_SCHOOLS, SchoolInfo } from './data/schools';
import { PRIMARY_GAMES } from './data/games';
import { 
  checkExistingRecord, 
  submitRegistration, 
  fetchAllRecords, 
  deleteLocalRecord,
  saveLocalRecords,
  getLocalRecords,
  fetchSchoolsFromMasterSheet,
  getCachedSchools
} from './services/apiService';
import { APP_CONFIG } from './config';
import { convertToHindi, filterStrictHindiOnly } from './utils/hindiHelper';

// Initial sample seed records matching official Swar data to give immediate visual value
const SEED_RECORDS: StudentRegistration[] = [
  {
    id: 'seed-1',
    rowNumber: 4,
    srNo: 1,
    timestamp: '22/10/2026 09:01:15',
    udiseCode: '09050306501',
    schoolName: 'AAKA NAGAR (PS)',
    nyayPanchayat: 'SHADINAGAR HAJIRA',
    schoolType: 'PS',
    level: 'प्राथमिक स्तर',
    gameName: '50 मीटर दौड़',
    gender: 'बालक',
    categorySheet: 'PS BOYS',
    penNumber: '21090503065',
    uniqueIdNumber: '90503065011',
    studentName: 'अमन कुमार',
    fatherName: 'श्री विनोद कुमार',
    studentClass: 'कक्षा 5',
    admissionNumber: '542',
    dob: '2015-04-12',
    aadhaarNumber: '7845 1209 3321',
    birthCertNumber: 'BC/2015/0984',
    birthCertAuthority: 'ग्राम विकास अधिकारी',
    identificationMark: 'माथे के बायीं ओर तिल',
    teethCount: '24',
    parentNameHindi: 'विनोद कुमार',
    parentMobile: '9837123456',
    headmasterName: 'राजेश कुमार शर्मा',
    headmasterMobile: '9412098765'
  },
  {
    id: 'seed-2',
    rowNumber: 5,
    srNo: 2,
    timestamp: '22/10/2026 09:15:40',
    udiseCode: '09050306517',
    schoolName: 'AAKA NAGAR (UPS)',
    nyayPanchayat: 'SHADINAGAR HAJIRA',
    schoolType: 'UPS',
    level: 'उच्च प्राथमिक स्तर',
    gameName: '100 मीटर दौड़',
    gender: 'बालिका',
    categorySheet: 'UPS GIRLS',
    penNumber: '21090503065',
    uniqueIdNumber: '90503065172',
    studentName: 'सोनम कुमारी',
    fatherName: 'श्री राम पाल',
    studentClass: 'कक्षा 8',
    admissionNumber: '312',
    dob: '2012-07-19',
    aadhaarNumber: '8912 4532 9901',
    birthCertNumber: 'BC/2012/1120',
    birthCertAuthority: 'रजिस्ट्रार जन्म एवं मृत्यु',
    identificationMark: 'दाहिने हाथ पर मस्सा',
    teethCount: '28',
    parentNameHindi: 'राम पाल',
    parentMobile: '9756112233',
    headmasterName: 'श्रीमती मीनाक्षी देवी',
    headmasterMobile: '9458998877'
  },
  {
    id: 'seed-3',
    rowNumber: 6,
    srNo: 3,
    timestamp: '22/10/2026 09:30:10',
    udiseCode: '09050313201',
    schoolName: 'AKBARABAD (PS)',
    nyayPanchayat: 'DADIYAL',
    schoolType: 'PS',
    level: 'प्राथमिक स्तर',
    gameName: 'लंबी कूद',
    gender: 'बालक',
    categorySheet: 'PS BOYS',
    penNumber: '21090503132',
    uniqueIdNumber: '90503132014',
    studentName: 'रोहित सिंह',
    fatherName: 'श्री जसवीर सिंह',
    studentClass: 'कक्षा 4',
    admissionNumber: '289',
    dob: '2016-02-08',
    aadhaarNumber: '5623 8812 0451',
    birthCertNumber: 'BC/2016/5421',
    birthCertAuthority: 'ग्राम पंचायत अधिकारी',
    identificationMark: 'ठोड़ी पर छोटा कट का निशान',
    teethCount: '22',
    parentNameHindi: 'जसवीर सिंह',
    parentMobile: '9897654321',
    headmasterName: 'मो० अतीक खां',
    headmasterMobile: '9411223344'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'sheet'>('form');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [records, setRecords] = useState<StudentRegistration[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live School_Master state from Google Sheet
  const [schoolsList, setSchoolsList] = useState<SchoolInfo[]>(() => getCachedSchools());
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLiveMaster, setIsLiveMaster] = useState(false);

  // Form State - UDISE is not prefilled initially
  const [formData, setFormData] = useState<StudentRegistration>({
    udiseCode: '',
    schoolName: '',
    nyayPanchayat: '',
    schoolType: '',
    level: 'प्राथमिक स्तर',
    gameName: PRIMARY_GAMES[0],
    gender: 'बालक',
    penNumber: '',
    uniqueIdNumber: '',
    studentName: '',
    fatherName: '',
    studentClass: 'कक्षा 5',
    admissionNumber: '',
    dob: '',
    aadhaarNumber: '',
    birthCertNumber: '',
    birthCertAuthority: 'ग्राम विकास अधिकारी',
    identificationMark: '',
    teethCount: '24',
    parentNameHindi: '',
    parentMobile: '',
    headmasterName: '',
    headmasterMobile: ''
  });

  // Determines whether the full form (game selector & student fields) should be opened
  const isUdiseFilled = Boolean(
    (formData.udiseCode && formData.udiseCode.trim().length >= 11) ||
    (formData.udiseCode && formData.udiseCode.trim().length >= 5 && formData.schoolName && formData.schoolName.trim().length > 0)
  );

  const [existingRecord, setExistingRecord] = useState<StudentRegistration | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Alert Modal State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    action: 'saved' | 'updated' | null;
    message: string;
    record: StudentRegistration | null;
    isLive: boolean;
  }>({
    isOpen: false,
    action: null,
    message: '',
    record: null,
    isLive: false,
  });

  // Fetch schools directly from "School_Master" sheet tab in Google Sheets
  const loadSchools = useCallback(async () => {
    setIsLoadingSchools(true);
    try {
      const res = await fetchSchoolsFromMasterSheet();
      if (res.schools && res.schools.length > 0) {
        setSchoolsList(res.schools);
        setIsLiveMaster(res.isLive);
      }
    } finally {
      setIsLoadingSchools(false);
    }
  }, []);

  // Initialize records and School_Master on startup
  useEffect(() => {
    const existing = getLocalRecords();
    if (existing && existing.length > 0) {
      setRecords(existing);
    } else {
      saveLocalRecords(SEED_RECORDS);
      setRecords(SEED_RECORDS);
    }
    loadData();
    loadSchools();
  }, [loadSchools]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchAllRecords();
      if (res.records && res.records.length > 0) {
        setRecords(res.records);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if a record exists for current UDISE + Game + Gender
  const checkDuplicate = useCallback(async (
    udise: string, 
    game: string, 
    gender: string,
    pen?: string
  ) => {
    if (!udise || !game || !gender) {
      setExistingRecord(null);
      return;
    }

    setIsChecking(true);
    try {
      const res = await checkExistingRecord({
        udiseCode: udise,
        gameName: game,
        gender: gender,
        penNumber: pen
      });

      if (res.found && res.record) {
        setExistingRecord(res.record);
        // Auto-fill form with the existing record data!
        setFormData((prev) => ({
          ...prev,
          ...res.record,
          rowNumber: res.record?.rowNumber,
          id: res.record?.id,
        }));
      } else {
        setExistingRecord(null);
        // If switching to a game that isn't registered, reset student personal fields while retaining school/game
        setFormData((prev) => ({
          ...prev,
          rowNumber: undefined,
          id: undefined,
          penNumber: '',
          uniqueIdNumber: '',
          studentName: '',
          fatherName: '',
          admissionNumber: '',
          dob: '',
          aadhaarNumber: '',
          birthCertNumber: '',
          identificationMark: '',
          parentNameHindi: '',
          parentMobile: ''
        }));
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Trigger check whenever UDISE, Game, or Gender changes
  useEffect(() => {
    checkDuplicate(formData.udiseCode, formData.gameName, formData.gender, formData.penNumber);
  }, [formData.udiseCode, formData.gameName, formData.gender, checkDuplicate]);

  // Handle School Selection
  const handleSchoolSelect = (school: SchoolInfo) => {
    const isUps = school.schoolType === 'UPS';
    const newLevel = isUps ? 'उच्च प्राथमिक स्तर' : 'प्राथमिक स्तर';
    
    // Auto-adjust class if current class is invalid for the new level
    let adjustedClass = formData.studentClass;
    if (!isUps && ['कक्षा 6', 'कक्षा 7', 'कक्षा 8'].includes(adjustedClass)) {
      adjustedClass = 'कक्षा 5';
    } else if (isUps && ['कक्षा 1', 'कक्षा 2', 'कक्षा 3', 'कक्षा 4', 'कक्षा 5'].includes(adjustedClass)) {
      adjustedClass = 'कक्षा 6';
    }

    setFormData((prev) => ({
      ...prev,
      udiseCode: school.udiseCode,
      schoolName: school.schoolName,
      nyayPanchayat: school.nyayPanchayat,
      schoolType: school.schoolType,
      level: newLevel,
      studentClass: adjustedClass,
    }));
  };

  const handleManualSchoolChange = (field: string, val: string) => {
    let extraUpdates: Partial<StudentRegistration> = {};
    if (field === 'schoolType') {
      const cleanType = val.toUpperCase().trim();
      if (cleanType === 'PS') {
        extraUpdates.level = 'प्राथमिक स्तर';
        if (['कक्षा 6', 'कक्षा 7', 'कक्षा 8'].includes(formData.studentClass)) {
          extraUpdates.studentClass = 'कक्षा 5';
        }
      } else if (cleanType === 'UPS') {
        extraUpdates.level = 'उच्च प्राथमिक स्तर';
        if (['कक्षा 1', 'कक्षा 2', 'कक्षा 3', 'कक्षा 4', 'कक्षा 5'].includes(formData.studentClass)) {
          extraUpdates.studentClass = 'कक्षा 6';
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: val,
      ...extraUpdates,
    }));
  };

  const handleLevelChange = (lvl: string) => {
    const isPrimary = lvl.includes('प्राथमिक स्तर') && !lvl.includes('उच्च');
    let adjustedClass = formData.studentClass;
    
    if (isPrimary && ['कक्षा 6', 'कक्षा 7', 'कक्षा 8'].includes(adjustedClass)) {
      adjustedClass = 'कक्षा 5';
    } else if (!isPrimary && ['कक्षा 1', 'कक्षा 2', 'कक्षा 3', 'कक्षा 4', 'कक्षा 5'].includes(adjustedClass)) {
      adjustedClass = 'कक्षा 6';
    }

    setFormData((prev) => ({
      ...prev,
      level: lvl,
      studentClass: adjustedClass,
    }));
  };

  const handleGameChange = (game: string) => {
    setFormData((prev) => ({
      ...prev,
      gameName: game,
    }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({
      ...prev,
      gender,
    }));
  };

  const handleInputChange = (field: keyof StudentRegistration, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetToNew = () => {
    setExistingRecord(null);
    setFormData((prev) => ({
      ...prev,
      id: undefined,
      rowNumber: undefined,
      penNumber: '',
      uniqueIdNumber: '',
      studentName: '',
      fatherName: '',
      admissionNumber: '',
      dob: '',
      aadhaarNumber: '',
      birthCertNumber: '',
      identificationMark: '',
      parentNameHindi: '',
      parentMobile: ''
    }));
  };

  const handleClearAll = () => {
    setExistingRecord(null);
    setFormData({
      udiseCode: '',
      schoolName: '',
      nyayPanchayat: '',
      schoolType: '',
      level: 'प्राथमिक स्तर',
      gameName: PRIMARY_GAMES[0],
      gender: 'बालक',
      penNumber: '',
      uniqueIdNumber: '',
      studentName: '',
      fatherName: '',
      studentClass: 'कक्षा 5',
      admissionNumber: '',
      dob: '',
      aadhaarNumber: '',
      birthCertNumber: '',
      birthCertAuthority: 'ग्राम विकास अधिकारी',
      identificationMark: '',
      teethCount: '24',
      parentNameHindi: '',
      parentMobile: '',
      headmasterName: '',
      headmasterMobile: ''
    });
  };

  // Submit / Update Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.udiseCode || !formData.schoolName) {
      alert('कृपया मान्य UDISE कोड दर्ज करें!');
      return;
    }
    if (!formData.studentName || !formData.fatherName) {
      alert('कृपया विजेता छात्र और पिता का नाम अवश्य भरें!');
      return;
    }

    // Strict uniqueness validation: PEN, Unique ID, Aadhaar, Birth Certificate must be unique
    const currentId = formData.id;
    const currentRow = formData.rowNumber;
    const otherRecords = records.filter(r => {
      if (currentId && r.id && r.id === currentId) return false;
      if (currentRow && r.rowNumber && r.rowNumber === currentRow) return false;
      return true;
    });

    const cleanPen = (formData.penNumber || '').trim();
    if (cleanPen) {
      const dupPen = otherRecords.find(r => (r.penNumber || '').trim() === cleanPen);
      if (dupPen) {
        alert(`अस्वीकार्य (Duplicate PEN): यह PEN (${cleanPen}) पहले से छात्र "${dupPen.studentName}" (${dupPen.schoolName}) के लिए दर्ज है! कृपया अद्वितीय PEN दर्ज करें।`);
        return;
      }
    }

    const cleanUnique = (formData.uniqueIdNumber || '').trim();
    if (cleanUnique) {
      const dupUnique = otherRecords.find(r => (r.uniqueIdNumber || '').trim() === cleanUnique);
      if (dupUnique) {
        alert(`अस्वीकार्य (Duplicate Unique ID): यह यूनिक आईडी नंबर (${cleanUnique}) पहले से छात्र "${dupUnique.studentName}" (${dupUnique.schoolName}) के लिए दर्ज है! कृपया अद्वितीय यूनिक आईडी दर्ज करें।`);
        return;
      }
    }

    // Strict validation: Aadhaar number is mandatory and must be exactly 12 digits & unique
    const aadhaarDigits = (formData.aadhaarNumber || '').replace(/[^0-9]/g, '');
    if (!aadhaarDigits) {
      alert('आधार नंबर अनिवार्य है! कृपया ठीक 12 अंकों का वैध आधार नंबर दर्ज करें।');
      return;
    }
    if (aadhaarDigits.length !== 12) {
      alert(`आधार नंबर ठीक 12 अंकों का होना अनिवार्य है! (वर्तमान में ${aadhaarDigits.length} अंक हैं)`);
      return;
    }
    const dupAadhaar = otherRecords.find(r => (r.aadhaarNumber || '').replace(/[^0-9]/g, '') === aadhaarDigits);
    if (dupAadhaar) {
      alert(`अस्वीकार्य (Duplicate Aadhaar): यह आधार नंबर पहले से छात्र "${dupAadhaar.studentName}" (${dupAadhaar.schoolName}) के लिए दर्ज है! कृपया सही व अद्वितीय आधार नंबर दर्ज करें।`);
      return;
    }

    const cleanBirthCert = (formData.birthCertNumber || '').trim().toLowerCase();
    if (cleanBirthCert) {
      const dupBirth = otherRecords.find(r => (r.birthCertNumber || '').trim().toLowerCase() === cleanBirthCert);
      if (dupBirth) {
        alert(`अस्वीकार्य (Duplicate Birth Certificate): यह जन्म प्रमाण पत्र क्रमांक (${formData.birthCertNumber}) पहले से छात्र "${dupBirth.studentName}" (${dupBirth.schoolName}) के लिए दर्ज है! कृपया अद्वितीय क्रमांक दर्ज करें।`);
        return;
      }
    }

    // Ensure all 5 Hindi-only inputs are converted and filtered to pure Hindi Devanagari
    const cleanedFormData: StudentRegistration = {
      ...formData,
      studentName: filterStrictHindiOnly(convertToHindi(formData.studentName)),
      fatherName: filterStrictHindiOnly(convertToHindi(formData.fatherName)),
      identificationMark: filterStrictHindiOnly(convertToHindi(formData.identificationMark)),
      parentNameHindi: filterStrictHindiOnly(convertToHindi(formData.parentNameHindi)),
      headmasterName: filterStrictHindiOnly(convertToHindi(formData.headmasterName)),
    };

    setIsSaving(true);
    try {
      const result = await submitRegistration(cleanedFormData);

      // Refresh records
      await loadData();

      // Trigger Alert Modal
      setAlertState({
        isOpen: true,
        action: result.action,
        message: result.message,
        record: result.record,
        isLive: result.isLive,
      });

      // Update current form's rowNumber if it was a new insert
      if (result.record.rowNumber) {
        setFormData((prev) => ({
          ...prev,
          rowNumber: result.record.rowNumber,
          id: result.record.id
        }));
        setExistingRecord(result.record);
      }

    } catch (err: any) {
      alert(`त्रुटि: ${err.message || 'डेटा सुरक्षित नहीं हो सका।'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit record from sheet view
  const handleEditRecordFromSheet = (item: StudentRegistration) => {
    setFormData(item);
    setExistingRecord(item);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete record from sheet view
  const handleDeleteRecord = (idOrRow: string | number) => {
    deleteLocalRecord(idOrRow);
    loadData();
    if (existingRecord && (existingRecord.id === idOrRow || existingRecord.rowNumber === idOrRow)) {
      handleResetToNew();
    }
  };

  // Compute number of entries registered for currently active unique UDISE code
  const currentUdiseEntriesCount = React.useMemo(() => {
    if (!formData.udiseCode) return 0;
    return records.filter((r) => r.udiseCode === formData.udiseCode).length;
  }, [records, formData.udiseCode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 text-slate-800 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetup={() => setIsSetupOpen(true)}
        totalEntries={records.length}
        currentUdise={formData.udiseCode}
        currentSchoolName={formData.schoolName}
        currentUdiseEntriesCount={currentUdiseEntriesCount}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* Tab 1: Card-based Registration Form */}
        {activeTab === 'form' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Step 1: School & UDISE Auto-Population Card (Synced with Google Sheet "School_Master") */}
            <SchoolSearchCard
              udiseCode={formData.udiseCode}
              schoolName={formData.schoolName}
              nyayPanchayat={formData.nyayPanchayat}
              schoolType={formData.schoolType}
              schools={schoolsList}
              isLiveMaster={isLiveMaster}
              isLoadingSchools={isLoadingSchools}
              onRefreshSchools={loadSchools}
              onSchoolSelect={handleSchoolSelect}
              onManualChange={handleManualSchoolChange}
              onClearSchool={handleClearAll}
              isFormOpened={isUdiseFilled}
            />

            {/* Step 2 & 3: Opened ONLY after filling the UDISE code */}
            {isUdiseFilled && (
              <>
                {/* Step 2: Game & Gender Selector with Existing Record Detector & School's Students List */}
                <GameAndGenderSelector
                  level={formData.level}
                  gameName={formData.gameName}
                  gender={formData.gender}
                  schoolType={formData.schoolType}
                  existingRecord={existingRecord}
                  isChecking={isChecking}
                  udiseCode={formData.udiseCode}
                  schoolName={formData.schoolName}
                  nyayPanchayat={formData.nyayPanchayat}
                  schoolStudents={records.filter((r) => r.udiseCode?.trim() === formData.udiseCode?.trim())}
                  onLevelChange={handleLevelChange}
                  onGameChange={handleGameChange}
                  onGenderChange={handleGenderChange}
                  onResetToNew={handleResetToNew}
                  onSelectStudent={handleEditRecordFromSheet}
                  onViewAllSheet={() => setActiveTab('sheet')}
                />

                {/* Step 3: Complete Student Details Card (with Submit / Update dynamic button) */}
                <StudentFormCard
                  formData={formData}
                  isExisting={Boolean(existingRecord || formData.rowNumber)}
                  isSaving={isSaving}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onClear={handleResetToNew}
                  existingRecords={records}
                />
              </>
            )}

          </div>
        )}

        {/* Tab 2: Full Sheet Register View (PDF exact format with distinct rows per game) */}
        {activeTab === 'sheet' && (
          <div className="animate-fadeIn">
            <SheetRegisterView
              records={records}
              currentUdise={formData.udiseCode}
              currentSchoolName={formData.schoolName}
              onEditRecord={handleEditRecordFromSheet}
              onDeleteRecord={handleDeleteRecord}
              onRefresh={loadData}
              isRefreshing={isRefreshing}
              onNavigateToForm={() => setActiveTab('form')}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-semibold text-slate-200">
            {APP_CONFIG.tournamentTitle} • {APP_CONFIG.blockName}
          </p>
          <p className="text-slate-500">
            तकनीकी सहायता: बेसिक शिक्षा विभाग (विकास खण्ड स्वार, रामपुर) • गूगल ऐप्स स्क्रिप्ट एवं गूगल शीट्स ऑटो-सिंक प्रणाली
          </p>
        </div>
      </footer>

      {/* Alert Modal for Save / Update Confirmation */}
      <AlertModal
        isOpen={alertState.isOpen}
        action={alertState.action}
        message={alertState.message}
        record={alertState.record}
        isLive={alertState.isLive}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        onRegisterNext={() => {
          setAlertState(prev => ({ ...prev, isOpen: false }));
          handleResetToNew();
        }}
        onViewSheet={() => {
          setAlertState(prev => ({ ...prev, isOpen: false }));
          setActiveTab('sheet');
        }}
      />

      {/* Google Apps Script & code.js Setup Modal */}
      <GasSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />

    </div>
  );
}
