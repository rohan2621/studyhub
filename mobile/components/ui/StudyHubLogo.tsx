import { Image } from "react-native";

export function StudyHubLogo({ size = 180 }) {
  return (
    <Image
      source={require("../../assets/logo/studyhub-logo.png")}
      style={{
        width: size,
        height: size,
        resizeMode: "contain",
      }}
    />
  );
}