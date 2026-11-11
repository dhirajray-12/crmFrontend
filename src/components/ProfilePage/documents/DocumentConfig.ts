import type { DocumentType } from "@/Store/document.store";

export interface DocumentConfigItem {
  type: DocumentType;
  label: string;
  description: string;
  gradient: string;
  borderColor: string;
  accept: string;
  maxSize: number;
  fieldName: string; // backend field name
}

export const documentConfigs: DocumentConfigItem[] = [
  {
    type: "idProof",
    label: "ID Proof",
    description: "Upload Aadhar / Passport / Govt ID",
    gradient: "from-blue-50/40 to-indigo-50/20",
    borderColor: "border-blue-100",
    accept: ".jpg,.jpeg,.png,.pdf",
    maxSize: 10,
    fieldName: "idDocument",
  },
  {
    type: "kycSelfie",
    label: "KYC Selfie",
    description: "Take a selfie holding your ID",
    gradient: "from-purple-100/40 to-pink-100/20",
    borderColor: "border-purple-100",
    accept: ".jpg,.jpeg,.png",
    maxSize: 5,
    fieldName: "address1Document",
  },
  {
    type: "addressProof",
    label: "Address Proof",
    description: "Utility bill / Bank statement (last 3 months)",
    gradient: "from-green-100/40 to-emerald-100/40",
    borderColor: "border-green-100",
    accept: ".jpg,.jpeg,.png,.pdf",
    maxSize: 10,
    fieldName: "address2Document",
  },
];
