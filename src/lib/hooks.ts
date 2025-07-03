import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  triggerScan,
  fetchScanLogs,
  fetchScanLogById,
  deleteScanLog,
  getScanStats,
  type XSSScanLog,
  type ScanResponse,
  type ApiError,
  fetchScanStatus,
  type ScanStatus,
  getScannerConfig,
  updateScannerConfig,
  resetScannerConfig,
  exportLogs,
  type ScannerConfig,
  fetchThreatLogs,
  createThreatLog,
} from './api';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Query keys for React Query
export const queryKeys = {
  scanLogs: ['scanLogs'] as const,
  scanLog: (id: number) => ['scanLog', id] as const,
  scanStats: ['scanStats'] as const,
};

/**
 * Hook to fetch all scan logs
 */
export const useScanLogs = () => {
  return useQuery({
    queryKey: queryKeys.scanLogs,
    queryFn: fetchScanLogs,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to fetch a specific scan log by ID
 */
export const useScanLog = (id: number) => {
  return useQuery({
    queryKey: queryKeys.scanLog(id),
    queryFn: () => fetchScanLogById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to fetch scan statistics
 */
export const useScanStats = () => {
  return useQuery({
    queryKey: queryKeys.scanStats,
    queryFn: getScanStats,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

/**
 * Hook to trigger a new scan
 */
export const useTriggerScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerScan,
    onSuccess: () => {
      // Invalidate and refetch scan logs and stats
      queryClient.invalidateQueries({ queryKey: queryKeys.scanLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanStats });
    },
    onError: (error: ApiError) => {
      console.error('Scan trigger failed:', error);
    },
  });
};

/**
 * Hook to delete a scan log
 */
export const useDeleteScanLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScanLog,
    onSuccess: (_, deletedId) => {
      // Remove the deleted item from cache
      queryClient.setQueryData<XSSScanLog[]>(
        queryKeys.scanLogs,
        (oldData) => oldData?.filter((log) => log.id !== deletedId)
      );
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.scanStats });
    },
    onError: (error: ApiError) => {
      console.error('Delete scan log failed:', error);
    },
  });
};

/**
 * Hook to get filtered scan logs by risk level
 */
export const useFilteredScanLogs = (riskFilter?: string) => {
  const { data: scanLogs, ...rest } = useScanLogs();

  const filteredLogs = riskFilter
    ? scanLogs?.filter((log) => log.risk.toLowerCase() === riskFilter.toLowerCase())
    : scanLogs;

  return {
    ...rest,
    data: filteredLogs,
  };
};

/**
 * Hook to get scan logs with search functionality
 */
export const useSearchScanLogs = (searchTerm?: string) => {
  const { data: scanLogs, ...rest } = useScanLogs();

  const searchedLogs = searchTerm
    ? scanLogs?.filter((log) =>
        log.alert.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : scanLogs;

  return {
    ...rest,
    data: searchedLogs,
  };
};

/**
 * Hook to poll scan status by scan_id
 */
export const useScanStatus = (scanId?: string) => {
  return useQuery({
    queryKey: ['scanStatus', scanId],
    queryFn: () => fetchScanStatus(scanId!),
    enabled: !!scanId,
    refetchInterval: 2000, // Poll every 2 seconds
  });
};

export const useScannerConfig = () => {
  return useQuery<ScannerConfig>({
    queryKey: ['scannerConfig'],
    queryFn: getScannerConfig,
    staleTime: 60000,
  });
};

export const useUpdateScannerConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScannerConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scannerConfig'] });
    },
  });
};

export const useResetScannerConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetScannerConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scannerConfig'] });
    },
  });
};

export const useExportLogs = () => {
  return useMutation({
    mutationFn: exportLogs,
  });
};

export const useThreatLogs = () =>
  useQuery({ queryKey: ['threatLogs'], queryFn: fetchThreatLogs });

export const useCreateThreatLog = () =>
  useMutation({ mutationFn: createThreatLog });

export function useAuthRedirect() {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.replace('/login?unauth=1');
    }
  }, [router]);
}