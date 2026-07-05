import { ReactNode } from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, View } from "react-native";
import { useThemeStore } from "../../stores/themeStore";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
}

export function GradientButton({ title, onPress, loading, disabled, style, icon }: Props) {
  const { colors, isDark } = useThemeStore();

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={style} activeOpacity={0.85}>
      <View
        style={{
          backgroundColor: isDark ? "#ffffff" : "#000000",
          borderWidth: 1,
          borderColor: isDark ? "#ffffff" : "#000000",
          borderRadius: 0,
          padding: 17,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        {loading
          ? <ActivityIndicator color={isDark ? "#000000" : "#ffffff"} />
          : <>
            {icon}
            <Text style={{ color: isDark ? "#000000" : "#ffffff", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 }}>{title}</Text>
          </>
        }
      </View>
    </TouchableOpacity>
  );
}