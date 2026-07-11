import { useState, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '../lib/api';

export interface AppRelease {
  id: string;
  versionCode: number;
  versionName: string;
  releaseNotes: string;
  fileUrl: string;
  isMandatory: boolean;
  createdAt: string;
}

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState<AppRelease | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // We only care about OTA updates on Android (since APKs are for Android).
    if (Platform.OS !== 'android') {
      setIsChecking(false);
      return;
    }

    // Do not check for updates in development mode (Expo Go testing)
    if (__DEV__) {
      setIsChecking(false);
      return;
    }

    const checkUpdate = async () => {
      try {
        const res = await api.get<AppRelease>('/appreleases/latest');
        const latestRelease = res.data;
        
        // Grab the current versionCode from app.json via expo-constants
        const currentVersionCode = Constants.expoConfig?.android?.versionCode ?? 1;

        if (latestRelease.versionCode > currentVersionCode) {
          setUpdateAvailable(latestRelease);
        }
      } catch (err) {
        console.log('Failed to check for updates:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkUpdate();
  }, []);

  const downloadUpdate = () => {
    if (!updateAvailable) return;
    // S3 fix: use the actual file download URL from the release directly,
    // rather than guessing a website URL via string manipulation.
    const downloadUrl = updateAvailable.fileUrl || (api.defaults.baseURL ?? "").replace("/api", "").concat("/download");
    Linking.openURL(downloadUrl).catch(() => {
      Alert.alert("Error", "Failed to open the download page.");
    });
  };

  const dismissUpdate = () => {
    setUpdateAvailable(null);
  };

  return {
    isChecking,
    updateAvailable,
    downloadUpdate,
    dismissUpdate
  };
}
