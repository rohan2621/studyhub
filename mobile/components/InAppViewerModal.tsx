import React from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { X, ShieldAlert } from "lucide-react-native";
import { useThemeStore } from "../stores/themeStore";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

export default function InAppViewerModal({ visible, url, title, onClose }: Props) {
  const { colors } = useThemeStore();

  if (!url) return null;

  // Render PDFs using Google Docs viewer for inline display on both platforms
  const isPdf = url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf");
  const viewerUrl = isPdf
    ? `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
    : url;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card
        }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text numberOfLines={1} style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
              {title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <ShieldAlert size={10} color={colors.accent} />
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Protected Document Viewer</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.border,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View style={{ flex: 1, position: "relative" }}>
          <WebView
            source={{ uri: viewerUrl }}
            style={{ flex: 1, backgroundColor: colors.background }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.background
              }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            // Disable native downloads or sharing in webview
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={false}
            injectedJavaScript={`
              (function() {
                // 1. Inject styles to disable text selection and callouts
                const style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = '* { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; }';
                document.head.appendChild(style);

                // 2. Prevent right-click / context menu
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                });

                // 3. For Google Docs PDF Viewer: attempt to hide download/popout icons if they appear
                const interval = setInterval(function() {
                  const downloadBtn = document.querySelector('[aria-label="Download"]') || document.querySelector('.ndfHFb-c4gZeb-hSRGPd');
                  if (downloadBtn) {
                    downloadBtn.style.display = 'none';
                  }
                  const popoutBtn = document.querySelector('[aria-label="Pop-out"]') || document.querySelector('.ndfHFb-c4gZeb-V67aGc');
                  if (popoutBtn) {
                    popoutBtn.style.display = 'none';
                  }
                }, 500);

                // Clear interval after 10 seconds to avoid memory leak
                setTimeout(function() {
                  clearInterval(interval);
                }, 10000);
              })();
            `}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
