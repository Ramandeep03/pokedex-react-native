import { Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PokedexHeader } from "@/components/PokedexHeader";
import { PokemonCard } from "@/components/PokemonCard";
import { ScreenMessage } from "@/components/ScreenMessage";
import { COLORS } from "@/constants/pokemon";
import { usePokemonList } from "@/hooks/usePokemonList";
import type { Pokemon } from "@/types/pokemon";

export default function PokedexScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const {
    pokemon,
    totalCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    retry,
  } = usePokemonList(query);

  const isIPad = Platform.OS === "ios" && Platform.isPad;
  const numColumns = isIPad || width >= 1200 ? 4 : width >= 820 ? 3 : 2;
  const isSearching = query.trim().length > 0;
  const pokemonRows = useMemo(() => {
    const rows: (Pokemon | null)[][] = [];
    for (let index = 0; index < pokemon.length; index += numColumns) {
      const row: (Pokemon | null)[] = pokemon.slice(index, index + numColumns);
      while (row.length < numColumns) row.push(null);
      rows.push(row);
    }
    return rows;
  }, [numColumns, pokemon]);

  const listHeader = useMemo(
    () => (
      <PokedexHeader
        count={isSearching ? totalCount : pokemon.length}
        isSearching={isSearching}
        isLoading={isLoading}
        query={query}
        onChangeQuery={setQuery}
      />
    ),
    [isLoading, isSearching, pokemon.length, query, totalCount],
  );
  const renderPokemonRow = useCallback(
    ({ item: row }: ListRenderItemInfo<(Pokemon | null)[]>) => (
      <View style={styles.cardRow}>
        {row.map((item, index) => (
          <View key={item?.id ?? `empty-${index}`} style={styles.cardCell}>
            {item ? (
              <PokemonCard
                compact={width < 820}
                pokemon={item}
                width="100%"
              />
            ) : null}
          </View>
        ))}
      </View>
    ),
    [width],
  );

  const listEmpty = useMemo(
    () => isLoading ? (
      <ScreenMessage
        loading
        title={isSearching ? "Searching the Pokédex" : "Finding Pokémon"}
        message={isSearching ? "Looking through every Pokémon name." : "Loading the first page."}
      />
    ) : error ? (
      <ScreenMessage
        title="Couldn’t load Pokémon"
        message="Check your connection and try again."
        actionLabel="Try again"
        onAction={retry}
      />
    ) : (
      <ScreenMessage
        title="No Pokémon found"
        message="Try a different name. Search checks the full Pokédex."
      />
    ),
    [error, isLoading, isSearching, retry],
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList<(Pokemon | null)[]>
        key={numColumns}
        data={pokemonRows}
        renderItem={renderPokemonRow}
        keyExtractor={(row) => String(row[0]?.id)}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          pokemon.length > 0 ? (
            <View style={styles.footer}>
              {error ? (
                <Pressable accessibilityRole="button" onPress={loadMore}>
                  <Text style={styles.footerError}>Couldn’t load more. Tap to retry.</Text>
                </Pressable>
              ) : null}
              {isLoadingMore ? (
                <ActivityIndicator color={COLORS.accent} />
              ) : !hasMore ? (
                <Text style={styles.endMessage}>You’ve caught them all!</Text>
              ) : null}
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        maxToRenderPerBatch={4}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.canvas,
    flex: 1,
  },
  listContent: {
    alignSelf: "center",
    gap: 10,
    maxWidth: 1160,
    paddingBottom: 28,
    paddingHorizontal: 16,
    width: "100%",
  },
  cardRow: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 5,
    width: "100%",
  },
  cardCell: {
    flex: 1,
  },
  footer: {
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
  footerError: {
    color: COLORS.accent,
    fontSize: 13,
    textAlign: "center",
  },
  endMessage: {
    color: COLORS.muted,
    fontSize: 13,
    paddingVertical: 12,
  },
});
