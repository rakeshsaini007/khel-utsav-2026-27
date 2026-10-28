export interface SchoolInfo {
  udiseCode: string;
  schoolName: string;
  nyayPanchayat: string;
  schoolType: 'PS' | 'UPS' | 'KGBV' | 'COMPOSITE';
  block?: string;
  district?: string;
}

export const INITIAL_SCHOOLS: SchoolInfo[] = [
  {
    udiseCode: "09050306501",
    schoolName: "AAKA NAGAR (PS)",
    nyayPanchayat: "SHADINAGAR HAJIRA",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050306517",
    schoolName: "AAKA NAGAR (UPS)",
    nyayPanchayat: "SHADINAGAR HAJIRA",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050300801",
    schoolName: "ABBAS NAGAR (PS)",
    nyayPanchayat: "BADLI",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050300802",
    schoolName: "ABBAS NAGAR KOYLI (PS)",
    nyayPanchayat: "MILAK TAJ KHAN",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050300820",
    schoolName: "ABBASPUR (PS)",
    nyayPanchayat: "BADLI",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050301001",
    schoolName: "AGLAGA (UPS)",
    nyayPanchayat: "DHANAURI",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050335001",
    schoolName: "AHMAD NAGAR KALAN (PS)",
    nyayPanchayat: "SHADINAGAR HAJIRA",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050335002",
    schoolName: "AHMAD NAGAR KALAN (UPS)",
    nyayPanchayat: "SHADINAGAR HAJIRA",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050319101",
    schoolName: "AJJUWALA (PS)",
    nyayPanchayat: "SHADINAGAR HAJIRA",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050313201",
    schoolName: "AKBARABAD (PS)",
    nyayPanchayat: "DADIYAL",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050313202",
    schoolName: "AKBARABAD (UPS)",
    nyayPanchayat: "DADIYAL",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050302101",
    schoolName: "ALINAGAR JANUBI (PS)",
    nyayPanchayat: "BADLI",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050302102",
    schoolName: "ALINAGAR SHUMALI (UPS)",
    nyayPanchayat: "BADLI",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050304501",
    schoolName: "BADLI RURAL (PS)",
    nyayPanchayat: "BADLI",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050304502",
    schoolName: "BADLI RURAL (UPS)",
    nyayPanchayat: "BADLI",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050307801",
    schoolName: "DADIYAL SHARQI (PS)",
    nyayPanchayat: "DADIYAL",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050307802",
    schoolName: "DADIYAL GARBI (UPS)",
    nyayPanchayat: "DADIYAL",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050309901",
    schoolName: "MASWASI (PS NO.1)",
    nyayPanchayat: "MASWASI",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050309902",
    schoolName: "MASWASI (UPS)",
    nyayPanchayat: "MASWASI",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050311201",
    schoolName: "MILAK TAJ KHAN (PS)",
    nyayPanchayat: "MILAK TAJ KHAN",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050311202",
    schoolName: "MILAK TAJ KHAN (UPS)",
    nyayPanchayat: "MILAK TAJ KHAN",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050314501",
    schoolName: "SUAR DEHAT (PS)",
    nyayPanchayat: "SUAR DEHAT",
    schoolType: "PS",
    block: "SWAR",
    district: "RAMPUR"
  },
  {
    udiseCode: "09050314502",
    schoolName: "SUAR DEHAT (UPS)",
    nyayPanchayat: "SUAR DEHAT",
    schoolType: "UPS",
    block: "SWAR",
    district: "RAMPUR"
  }
];

export function findSchoolByUdise(udise: string): SchoolInfo | null {
  const clean = udise.trim();
  if (!clean) return null;
  const found = INITIAL_SCHOOLS.find(s => s.udiseCode === clean);
  return found || null;
}
