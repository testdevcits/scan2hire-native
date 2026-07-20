// src/types/user.ts

export interface CloudinaryAsset {
  url: string;
  public_id: string;
}

export interface EmployeeDocuments {
  photo?: CloudinaryAsset;
  resume?: CloudinaryAsset;
  salarySlips?: any[];
}

export interface EmployeeProfile {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  reportingManager: string;
  employeeType: string;
  isActive: boolean;
  documents: EmployeeDocuments;
  createdAt: string;
  updatedAt: string;
  user: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  isActive: boolean;
  profileImage?: string;
  documents?: {
    photo?: CloudinaryAsset;
  };
  employeeProfile?: EmployeeProfile;
}