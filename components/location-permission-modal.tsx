
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X, AlertCircle } from 'lucide-react';

interface LocationPermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

export function LocationPermissionModal({
  open,
  onOpenChange,
  onPermissionGranted,
  onPermissionDenied
}: LocationPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      localStorage.setItem('treinei_location_permission', 'granted');
      onPermissionGranted();
      onOpenChange(false);
    } catch (error: any) {
      localStorage.setItem('treinei_location_permission', 'denied');
      onPermissionDenied();
      onOpenChange(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('treinei_location_permission', 'denied');
    onPermissionDenied();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md mx-4">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-full bg-blue-500/20 text-blue-400"
            >
              <Navigation className="h-8 w-8" />
            </motion.div>
          </div>
          
          <DialogTitle className="text-center text-xl">
            Habilitar Localização
          </DialogTitle>
          
          <DialogDescription className="text-center text-muted-foreground">
            Nossa nova atualização agora captura automaticamente sua localização durante o check-in para uma experiência mais completa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefícios */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Localização Automática</p>
                <p className="text-xs text-muted-foreground">
                  Não precisa mais digitar onde está treinando
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Privacidade Protegida</p>
                <p className="text-xs text-muted-foreground">
                  Usamos sua localização apenas durante o check-in
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full glass hover:bg-blue-500/20 transition-all duration-300"
            >
              {isRequesting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {isRequesting ? 'Obtendo permissão...' : 'Permitir Localização'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isRequesting}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Agora não
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Você pode alterar essa configuração a qualquer momento nas configurações do navegador.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}