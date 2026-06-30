import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { useThemeStore } from "../../stores/themeStore";

interface Props extends TextInputProps {
  label: string;
  icon: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
}

export function FloatingInput({
  label,
  icon,
 rightIcon,
  onRightIconPress,
  error,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false);
  const { colors } = useThemeStore();

  return (
    <View style={{ marginBottom: 18 }}>
      {/* Label */}
      <Text
        style={{
          color: colors.text,
          fontSize: 14,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {label}
      </Text>

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: error
            ? colors.danger
            : focused
            ? colors.primary
            : colors.border,
          paddingHorizontal: 14,
          height: 54,
        }}
      >
        {/* Left Icon */}
        <Text
          style={{
            fontSize: 18,
            marginRight: 12,
          }}
        >
          {icon}
        </Text>

        <TextInput
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 16,
          }}
          placeholder={props.placeholder}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Text style={{ fontSize: 18 }}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error ? (
        <Text
          style={{
            color: colors.danger,
            fontSize: 12,
            marginTop: 6,
            marginLeft: 2,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}