import { Link } from "expo-router";
import { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";

import { TypeBadge } from "@/components/TypeBadge";
import {
  COLORS,
  POKEMON_TYPE_COLORS
} from "@/constants/pokemon";
import type { Pokemon } from "@/types/pokemon";
import { formatPokemonName } from "@/utils/pokemon";

interface PokemonCardProps {
  pokemon: Pokemon;
  compact?: boolean;
  width: DimensionValue;
}

function PokemonCardComponent({ pokemon, compact = false, width }: PokemonCardProps) {
  const typeColor = POKEMON_TYPE_COLORS[pokemon.types[0]] + 50;
  const formattedName = formatPokemonName(pokemon.name);

  return (
    <Link
      href={{ pathname: "/details", params: { name: pokemon.name } }}
      asChild
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`View ${formattedName} details`}
        style={({ pressed }) => [
          styles.card,
          compact && styles.compactCard,
          { backgroundColor: typeColor, borderColor: `${typeColor}45`, width },
          pressed && styles.pressed,
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.cardBackground, { backgroundColor: typeColor }]}
        />
        <View style={[styles.cardContent, compact && styles.compactCardContent]}>
          <View style={styles.topRow}>
            <Text style={styles.number}>#{String(pokemon.id).padStart(3, "0")}</Text>
          </View>
          <View style={[styles.imageWrap, compact && styles.compactImageWrap]}>
            {pokemon.image ? (
              <Image
                accessibilityLabel={`${formattedName} artwork`}
                source={{ uri: pokemon.image }}
                resizeMode="contain"
                style={styles.image}
              />
            ) : (
              <Text style={styles.placeholderNumber}>{pokemon.id}</Text>
            )}
          </View>
          <Text numberOfLines={1} style={[styles.name, compact && styles.compactName]}>
            {formattedName}
          </Text>
          <View style={styles.types}>
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} compact />
            ))}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export const PokemonCard = memo(PokemonCardComponent);

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 300,
    overflow: "hidden",
    padding: 0,
  },
  compactCard: {
    minHeight: 250,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  cardBackground: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
  },
  cardContent: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    flexGrow: 1,
    gap: 10,
    padding: 20,
  },
  compactCardContent: {
    padding: 16,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  number: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  imageWrap: {
    alignItems: "center",
    alignSelf: "center",
    aspectRatio: 1,
    justifyContent: "center",
    marginBottom: 2,
    maxWidth: 144,
    width: "100%",
  },
  compactImageWrap: {
    maxWidth: 112,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  placeholderNumber: {
    color: COLORS.muted,
    fontSize: 20,
    fontWeight: "800",
  },
  name: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: "800",
    width: "100%",
  },
  compactName: {
    fontSize: 16,
  },
  types: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    width: "100%",
  },
});
