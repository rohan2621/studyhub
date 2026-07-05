import { TouchableOpacity } from "react-native";
import { Sun, Moon } from "lucide-react-native";
import { useThemeStore } from "../../stores/themeStore";

export function ThemeToggle() {
  const { isDark, toggle, colors } = useThemeStore();

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.75}
      style={{
        width: 44,
        height: 44,
        borderRadius: 0,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: "center",
        alignItems: "center",
        }}
    >
      {isDark ? (
        <Sun size={20} color="#f59e0b" strokeWidth={2.2} />
      ) : (
        <Moon size={20} color={colors.primary} strokeWidth={2.2} />
      )}
    </TouchableOpacity>
  );
}