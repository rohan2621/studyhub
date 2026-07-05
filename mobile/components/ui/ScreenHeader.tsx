import { View, Text } from "react-native";
import { useThemeStore } from "../../stores/themeStore";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  title: string;
  subtitle?: string;
  showThemeToggle?: boolean;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showThemeToggle, rightElement }: Props) {
  const { colors } = useThemeStore();

  return (
    <View
      style={{ 
        paddingTop: 60, 
        paddingHorizontal: 20, 
        paddingBottom: 20, 
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>{title}</Text>
          {subtitle && <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>{subtitle}</Text>}
        </View>
        {showThemeToggle && <ThemeToggle />}
        {rightElement}
      </View>
    </View>
  );
}