import { useState, ReactNode } from "react";
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
  icon: ReactNode;
  rightIcon?: ReactNode;
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

      {/* Input Container */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: error
            ? colors.danger
            : focused
            ? colors.primary
            : colors.border,
          paddingHorizontal: 14,
          height: 56,
        }}
      >
        {/* Left Icon */}
        <View
          style={{
            marginRight: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {icon}
        </View>

        {/* Text Input */}
        <TextInput
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 16,
            paddingVertical: 0,
          }}
          placeholder={props.placeholder}
          placeholderTextColor={colors.textMuted}
          cursorColor={colors.primary}      // Android
          selectionColor={colors.primary}   // Android & iOS
          caretHidden={false}
          underlineColorAndroid="transparent"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            activeOpacity={0.7}
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {rightIcon}
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