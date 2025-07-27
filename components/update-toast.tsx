// components/update-toast.tsx
"use client";

import { useEffect } from 'react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

export function UpdateToast() {
  const { updateAvailable, isUpdating, applyUpdate } = useServiceWorkerUpdate();

  useEffect(() => {
    if (updateAvailable && !isUpdating) {
      toast.info('Nova atualização disponível!', {
        position: 'bottom-center',
        duration: Infinity, 
        action: (
          <Button
            size="sm"
            onClick={applyUpdate}
            disabled={isUpdating}
            className="h-8 px-3 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Atualizar Agora
          </Button>
        ),
        icon: isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />,
      });
    }
  }, [updateAvailable, isUpdating, applyUpdate]);

  return null;
}