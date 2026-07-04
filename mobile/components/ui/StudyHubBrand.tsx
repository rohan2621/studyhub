import { View, Text } from "react-native";
import { useThemeStore } from "../../stores/themeStore";
import { StudyHubLogo } from "./StudyHubLogo";

interface Props {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function StudyHubBrand({ size = "md", showTagline = true }: Props) {
  const { colors, isDark } = useThemeStore();

  const logoSize = { sm: 48, md: 72, lg: 100 }[size];
  const titleSize = { sm: 20, md: 28, lg: 36 }[size];

  return (
    <View style={{ alignItems: "center" }}>
      <StudyHubLogo size={logoSize} />
      <Text style={{
        fontSize: titleSize,
        fontWeight: "900",
        letterSpacing: -0.5,
        marginTop: 8,
      }}>
        <Text style={{ color: colors.text }}>Study</Text>
        <Text style={{ color: colors.primary }}>Hub</Text>
      </Text>
      {showTagline && (
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, letterSpacing: 0.3 }}>
          Learn. Organize. Achieve.
        </Text>
      )}
    </View>
  );
}