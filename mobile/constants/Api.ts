export const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://studyhub-api-mpor.onrender.com";

export const PLANS = [
  { key: "OneWeek", label: "1 Week", days: 7 },
  { key: "OneMonth", label: "1 Month", days: 30 },
  { key: "TwoMonths", label: "2 Months", days: 60 },
  { key: "ThreeMonths", label: "3 Months", days: 90 },
  { key: "SixMonths", label: "6 Months", days: 180 },
  { key: "OneYear", label: "1 Year", days: 365 },
];