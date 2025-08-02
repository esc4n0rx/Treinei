"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AuthTabs } from "@/components/auth-tabs";
import { LocationPermissionModal } from "@/components/location-permission-modal";
import { getLocationPermissionState } from '@/lib/utils/location';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const permissionState = getLocationPermissionState();
      
      if (permissionState === null) {
        setShowLocationModal(true);
      }
    }
  }, [loading, isAuthenticated]);

  const handleLocationPermissionGranted = () => {
    console.log('Permissão de localização concedida');
  };

  const handleLocationPermissionDenied = () => {
    console.log('Permissão de localização negada');
  };

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-5" />
        <AuthTabs />
      </div>

      <LocationPermissionModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
        onPermissionGranted={handleLocationPermissionGranted}
        onPermissionDenied={handleLocationPermissionDenied}
      />
    </>
  );
}