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
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={style} activeOpacity={0.85}>
      <View
        style={{
          borderRadius: 0,
          padding: 17,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          opacity: disabled || loading ? 0.55 : 1,
        }}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
            {icon}
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 }}>{title}</Text>
          </>
        }
      </View>
    </TouchableOpacity>
  );
}