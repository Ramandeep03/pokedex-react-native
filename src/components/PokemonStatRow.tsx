import { StyleSheet, Text, View } from "react-native";

import { COLORS, POKEMON_STAT_LABELS } from "@/constants/pokemon";
import type { PokemonStat } from "@/types/pokemon";

interface PokemonStatRowProps {
  stat: PokemonStat;
  color: string;
}

export function PokemonStatRow({ stat, color }: PokemonStatRowProps) {
  const width = `${Math.min((stat.value / 255) * 100, 100)}%` as `${number}%`;

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {POKEMON_STAT_LABELS[stat.name] ?? stat.name}
      </Text>
      <Text style={styles.value}>{stat.value}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    width: 60,
  },
  value: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    width: 28,
  },
  track: {
    backgroundColor: COLORS.border,
    borderRadius: 5,
    flex: 1,
    height: 8,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 5,
    height: "100%",
  },
});
