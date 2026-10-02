import { Host, TextInput as NativeTextInput } from "@expo/ui";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/pokemon";

interface PokedexHeaderProps {
  count: number;
  query: string;
  isSearching: boolean;
  isLoading: boolean;
  onChangeQuery: (query: string) => void;
}

export function PokedexHeader({
  count,
  query,
  isSearching,
  isLoading,
  onChangeQuery,
}: PokedexHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>
      <Text style={styles.subtitle}>
        Discover Pokémon, learn their strengths, and find your favorites.
      </Text>
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Host style={styles.searchHost}>
          <NativeTextInput
            autoCapitalize="none"
            autoCorrect={false}
            defaultValue={query}
            onChangeText={onChangeQuery}
            placeholder="Search by name"
            placeholderTextColor="#9298A3"
            returnKeyType="search"
            style={styles.searchInput}
            textStyle={styles.searchText}
          />
        </Host>
      </View>
      <Text style={styles.count}>
        {isLoading
          ? isSearching
            ? "Searching the full Pokédex…"
            : "Loading your Pokédex…"
          : isSearching
            ? `${count} ${count === 1 ? "match" : "matches"}`
            : `${count} Pokémon loaded`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingBottom: 20,
    paddingTop: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 500,
  },
  searchWrap: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: COLORS.muted,
    fontSize: 24,
    lineHeight: 26,
    transform: [{ rotate: "-25deg" }],
  },
  searchHost: {
    flex: 1,
    height: 48,
    justifyContent: "center",
  },
  searchInput: {
    height: 48,
    width: "100%",
  },
  searchText: {
    color: COLORS.ink,
    fontSize: 15,
  },
  count: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});
