declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

// ─── Module stubs for packages without bundled types ───────────────────────

declare module "react-native-toast-message" {
  import React from "react";
  interface ToastOptions {
    type?: "success" | "error" | "info";
    text1?: string;
    text2?: string;
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
    onShow?: () => void;
    onHide?: () => void;
    onPress?: () => void;
    position?: "top" | "bottom";
    [key: string]: any;
  }
  const Toast: {
    show: (options: ToastOptions) => void;
    hide: () => void;
  } & React.ComponentType<any>;
  export default Toast;
}

declare module "react-native-webview" {
  import React from "react";
  import { ViewStyle } from "react-native";
  export interface WebViewProps {
    source?: { uri?: string; html?: string };
    style?: ViewStyle;
    allowsInlineMediaPlayback?: boolean;
    javaScriptEnabled?: boolean;
    onLoad?: () => void;
    onError?: (e: any) => void;
    [key: string]: any;
  }
  export class WebView extends React.Component<WebViewProps> {}
}

declare module "@tanstack/react-query-persist-client" {
  export * from "@tanstack/react-query";
  export function PersistQueryClientProvider(props: any): JSX.Element;
  export function persistQueryClient(options: any): Promise<void>;
  export interface PersistQueryClientOptions {
    queryClient: any;
    persister: any;
    maxAge?: number;
    buster?: string;
    hydrateOptions?: any;
    dehydrateOptions?: any;
  }
}

declare module "@tanstack/query-async-storage-persister" {
  export function createAsyncStoragePersister(options: {
    storage: any;
    key?: string;
    throttleTime?: number;
    serialize?: (data: any) => string;
    deserialize?: (data: string) => any;
  }): any;
}

// ─── NativeWind className prop augmentation ────────────────────────────────
// Allows `className` on all core React Native components (NativeWind-style)

import "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface TouchableHighlightProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface FlatListProps<ItemT> {
    className?: string;
  }
  interface SectionListProps<ItemT, SectionT> {
    className?: string;
  }
  interface SafeAreaViewProps {
    className?: string;
  }
  interface ActivityIndicatorProps {
    className?: string;
  }
}