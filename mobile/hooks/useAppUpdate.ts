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

    const checkUpdate = async () => {
      try {
        const res = await api.get<AppRelease>('/api/appreleases/latest');
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
    
    // Construct the URL to the website's download page
    // Using the API base URL but swapping the port to the website's port (5173)
    const baseUrl = api.defaults.baseURL || 'http://192.168.18.11:5244';
    const websiteUrl = baseUrl.replace('5244', '5173').replace('/api', '');
    const downloadPageUrl = `${websiteUrl}/download`;
    
    Linking.openURL(downloadPageUrl).catch(err => {
      Alert.alert('Error', 'Failed to open the download page.');
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
