import { View, TouchableOpacity, Text } from "react-native";
import { useThemeStore } from "../../stores/themeStore";

export function ThemeToggle() {
  const { colors, mode, setTheme } = useThemeStore();

  return (
    <View style={{
      flexDirection: "row",
      backgroundColor: colors.card + "EE",
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    }}>
      {[
        { label: "☀️", value: "light" },
        { label: "💻", value: "system" },
        { label: "🌙", value: "dark" },
      ].map((item) => (
        <TouchableOpacity
          key={item.value}
          onPress={() => setTheme(item.value as any)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: mode === item.value ? colors.primary : "transparent",
          }}
        >
          <Text style={{ fontSize: 15 }}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}