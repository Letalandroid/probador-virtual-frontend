import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useServiceStatus } from '@/hooks/useServiceStatus';

const ServiceStatus = () => {
  const { status, isLoading, error, checkStatus } = useServiceStatus(false);

  const getStatusIcon = (isActive: boolean) => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    return isActive ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (statusType: string) => {
    switch (statusType) {
      case 'active':
        return <Badge className="bg-green-500">Activo</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degradado</Badge>;
      case 'timeout':
        return <Badge className="bg-red-500">Timeout</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Estado de Servicios</CardTitle>
            <CardDescription>
              Verificación del estado de los servicios del sistema
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !status ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Verificando servicios...
            </span>
          </div>
        ) : status ? (
          <div className="space-y-4">
            {/* Estado General */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Estado General</span>
              </div>
              {getStatusBadge(status.status)}
            </div>

            {/* Servicios Individuales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.services.backend)}
                  <span className="text-sm">Backend API</span>
                </div>
                {status.services.backend ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Inactivo
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.services.database)}
                  <span className="text-sm">Base de Datos</span>
                </div>
                {status.services.database ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Inactivo
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.services.aiService)}
                  <span className="text-sm">Servicio de IA</span>
                </div>
                {status.services.aiService ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Tiempo de respuesta:</span>
                <span className="font-mono">{status.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Última verificación:</span>
                <span className="font-mono">
                  {new Date(status.timestamp).toLocaleTimeString('es-ES')}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se ha verificado el estado de los servicios</p>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              className="mt-4"
            >
              Verificar Ahora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceStatus;

