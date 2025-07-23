// components/update-prompt.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, RefreshCw } from 'lucide-react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { toast } from 'sonner';

export function UpdatePrompt() {
  const { updateAvailable, isUpdating, applyUpdate } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when a new update is available
  useEffect(() => {
    if (updateAvailable) {
      setDismissed(false);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    try {
      await applyUpdate();
      toast.success('Aplicativo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao aplicar atualização:', error);
      toast.error('Erro ao atualizar o aplicativo');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="glass-card border border-primary/20 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Nova atualização disponível
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Uma nova versão do aplicativo está pronta para instalação
                </p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="h-8 px-3 text-xs"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        Atualizar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Mais tarde
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}