// src/hooks/useDriverMe.ts
import { useState, useEffect, useCallback } from 'react';
import { MeResponse } from '../types/driver';
import driverService from '../api/services/driverService';

export const useDriverMe = () => {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await driverService.getMe();
      setData(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch driver credentials.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverData();
  }, [fetchDriverData]);

  return {
    driver: data?.driver || null,
    vehicle: data?.vehicle || null,
    activeShipment: data?.shipment || null,
    allShipments: data?.allShipments || [],
    loading,
    error,
    refresh: fetchDriverData,
  };
};