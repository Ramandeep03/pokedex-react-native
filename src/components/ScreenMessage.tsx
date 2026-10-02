import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/pokemon";

interface ScreenMessageProps {
  title: string;
  message: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function ScreenMessage({
  title,
  message,
  loading = false,
  actionLabel,
  onAction,
}: ScreenMessageProps) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={COLORS.accent} /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  action: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  pressed: {
    opacity: 0.8,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
