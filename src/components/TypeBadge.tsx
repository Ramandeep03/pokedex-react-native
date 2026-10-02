import { StyleSheet, Text, View } from "react-native";

import { POKEMON_TYPE_COLORS } from "@/constants/pokemon";
import { formatPokemonName } from "@/utils/pokemon";

interface TypeBadgeProps {
  type: string;
  compact?: boolean;
}

export function TypeBadge({ type, compact = false }: TypeBadgeProps) {
  const color = POKEMON_TYPE_COLORS[type] ?? POKEMON_TYPE_COLORS.normal;

  return (
    <View style={[styles.badge, compact && styles.compact, { backgroundColor: color }]}>
      <Text style={[styles.label, compact && styles.compactLabel]}>
        {formatPokemonName(type)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  compactLabel: {
    fontSize: 11,
  },
});
