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
  breaks?: {
    type: BreakType | 'location';
    startAt: string;
    endAt?: string | null;
    minutes?: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const ensureSuccess = <T,>(response: ApiResponse<T>): ApiResponse<T> => {
  if (!response.success) {
    throw { message: response.message || 'Request failed', raw: response };
  }
  return response;
};

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
    return ensureSuccess(response as unknown as ApiResponse<AttendanceRecord>);
  },

  /**
   * End Day Attendance / Check-out
   */
  endAttendance: async (): Promise<ApiResponse<AttendanceRecord>> => {
    const response = await axiosClient.post<ApiResponse<AttendanceRecord>>(
      '/users/attendance/end',
      {}
    );
    return ensureSuccess(response as unknown as ApiResponse<AttendanceRecord>);
  },

  /**
   * Fetch Recent / Daily Attendance History for the Logged-In User
   */
  getAttendanceHistory: async (): Promise<ApiResponse<AttendanceRecord[]>> => {
    const response = await axiosClient.get<ApiResponse<AttendanceRecord[]>>(
      '/users/attendance'
    );
    return ensureSuccess(response as unknown as ApiResponse<AttendanceRecord[]>);
  },

  syncLocation: async (
    location: LocationCoords
  ): Promise<ApiResponse<{
    action: 'paused' | 'resumed' | 'already_paused' | 'updated' | 'remote_allowed';
    withinRadius: boolean;
    distanceFromOfficeMeters: number | null;
    allowedRadiusMeters: number | null;
    attendance: AttendanceRecord;
  }>> => {
    const response = await axiosClient.post<ApiResponse<any>>(
      '/users/attendance/location',
      {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy ? Math.round(location.accuracy) : 15,
        },
      }
    );
    return ensureSuccess(response as unknown as ApiResponse<{
      action: 'paused' | 'resumed' | 'already_paused' | 'updated' | 'remote_allowed';
      withinRadius: boolean;
      distanceFromOfficeMeters: number | null;
      allowedRadiusMeters: number | null;
      attendance: AttendanceRecord;
    }>);
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
      '/users/attendance/break/start',
      payload
    );
    return ensureSuccess(response as unknown as ApiResponse<any>);
  },

  /**
   * End Break Session
   */
  endBreak: async (): Promise<ApiResponse<any>> => {
    const response = await axiosClient.post<ApiResponse<any>>(
      '/users/attendance/break/end',
      {}
    );
    return ensureSuccess(response as unknown as ApiResponse<any>);
  },
};

export const authService = {

  requestPasswordOtp: async (
    email: string
  ): Promise<ApiResponse<null | Record<string, never>>> => {
    const response = await axiosClient.post<ApiResponse<null>>(
      '/employees/forgot-password',
      { email }
    );
    return ensureSuccess(response as unknown as ApiResponse<null>);
  },

  verifyOtp: async (
    email: string,
    otp: string
  ): Promise<ApiResponse<null | Record<string, never>>> => {
    const response = await axiosClient.post<ApiResponse<null>>(
      '/employees/forgot-password/verify-otp',
      { email, otp }
    );
    return ensureSuccess(response as unknown as ApiResponse<null>);
  },
 

  resetPassword: async (
    payload: { email: string; resetToken: string; password: string }
  ): Promise<ApiResponse<null | Record<string, never>>> => {
    const response = await axiosClient.post<ApiResponse<null>>(
      '/employees/forgot-password/reset',
      payload
    );
    return ensureSuccess(response as unknown as ApiResponse<null>);
  },
};
