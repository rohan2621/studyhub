import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "../../stores/themeStore";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export function GradientButton({ title, onPress, loading, disabled, style, icon }: Props) {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={style}>
      <LinearGradient
        colors={colors.primaryGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 18, padding: 18,
          flexDirection: "row",
          justifyContent: "center", alignItems: "center", gap: 10,
          opacity: disabled || loading ? 0.6 : 1,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17, letterSpacing: 0.5 }}>{title}</Text>
            {icon && <Text style={{ color: "#fff", fontSize: 20 }}>{icon}</Text>}
          </>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}