import { View, Text } from "react-native";
import { StudyHubLogo } from "./StudyHubLogo";
import { useThemeStore } from "../../stores/themeStore";

interface Props {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function StudyHubBrand({ size = "md", showTagline = true }: Props) {
  const { colors, isDark } = useThemeStore();

  const logoSize = { sm: 64, md: 96, lg: 128 }[size];
  const titleSize = { sm: 24, md: 32, lg: 40 }[size];

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