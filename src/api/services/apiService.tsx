// src/services/apiService.ts

import axiosClient from "../axiosClient";

 
// Input Interfaces
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type BreakType = 'lunch' | 'call' | 'tea' | 'personal' | 'other';

// API Response Interfaces
export interface SelfieResponse {
  url: string;
  public_id: string;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  accuracy: number;
  distanceFromOfficeMeters: number;
  officeLatitude: number;
  officeLongitude: number;
  radiusMeters: number;
  withinRadius: boolean;
}

export interface AttendanceRecord {
  _id: string;
  employee?: string;
  user?: string;
  dateKey: string;
  loginAt: string;
  logoutAt: string | null;
  status: 'running' | 'present' | 'half_day' | 'absent';
  loginSelfie?: SelfieResponse;
  loginLocation?: LocationResponse;
  totalWorkMinutes?: number;
  totalBreakMinutes?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Service Implementation
export const attendanceService = {
  /**
   * Start Day Attendance with Selfie & Location
   * @param selfieBase64 - Pure base64 string from the camera
   * @param location - GPS location coordinates
   */
  startAttendance: async (
    selfieBase64: string,
    location: LocationCoords
  ): Promise<ApiResponse<AttendanceRecord>> => {
    const payload = {
      selfie: {
        dataUri: `data:image/jpeg;base64,${selfieBase64}`,
      },
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy ? Math.round(location.accuracy) : 15,
      },
    };

    // axiosClient returns response.data directly due to its response interceptor
    const response = await axiosClient.post<ApiResponse<AttendanceRecord>>(
      '/users/attendance/start',
      payload
    );
    return response as unknown as ApiResponse<AttendanceRecord>;
  },

  /**
   * End Day Attendance / Check-out
   */
  endAttendance: async (): Promise<ApiResponse<AttendanceRecord>> => {
    const response = await axiosClient.post<ApiResponse<AttendanceRecord>>(
      '/employees/attendance/end',
      {}
    );
    return response as unknown as ApiResponse<AttendanceRecord>;
  },

  /**
   * Fetch Recent / Daily Attendance History for the Logged-In User
   */
  getAttendanceHistory: async (): Promise<ApiResponse<AttendanceRecord[]>> => {
    const response = await axiosClient.get<ApiResponse<AttendanceRecord[]>>(
      '/employees/attendance'
    );
    return response as unknown as ApiResponse<AttendanceRecord[]>;
  },

  /**
   * Start Break Session
   * @param breakType - Action classification
   */
  startBreak: async (
    breakType: BreakType = 'lunch'
  ): Promise<ApiResponse<any>> => {
    const payload = {
      type: breakType,
    };
    const response = await axiosClient.post<ApiResponse<any>>(
      '/employees/attendance/break/start',
      payload
    );
    return response as unknown as ApiResponse<any>;
  },

  /**
   * End Break Session
   */
  endBreak: async (): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post<ApiResponse<any>>(
      '/employees/attendance/break/end',
      {}
    );
    return response as unknown as ApiResponse<any>;
  },
};