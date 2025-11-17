import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

export interface ServiceStatus {
  status: 'active' | 'degraded' | 'timeout';
  services: {
    backend: boolean;
    database: boolean;
    aiService: boolean;
  };
  responseTime: number;
  timestamp: string;
  error?: string;
}

export const useServiceStatus = (autoCheck: boolean = true, interval: number = 30000) => {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.checkServiceStatus();
      
      if (response.error) {
        setError(response.error);
        if (response.data) {
          setStatus(response.data);
        }
      } else if (response.data) {
        setStatus(response.data);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar el estado de los servicios');
      setStatus({
        status: 'timeout',
        services: {
          backend: false,
          database: false,
          aiService: false,
        },
        responseTime: 3000,
        timestamp: new Date().toISOString(),
        error: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      // Verificar inmediatamente
      checkStatus();

      // Configurar verificación periódica
      const intervalId = setInterval(checkStatus, interval);

      return () => clearInterval(intervalId);
    }
  }, [autoCheck, interval]);

  return {
    status,
    isLoading,
    error,
    checkStatus,
  };
};

