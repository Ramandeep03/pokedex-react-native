import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PokemonStatRow } from "@/components/PokemonStatRow";
import { ScreenMessage } from "@/components/ScreenMessage";
import { TypeBadge } from "@/components/TypeBadge";
import { COLORS, POKEMON_TYPE_COLORS } from "@/constants/pokemon";
import { usePokemonDetails } from "@/hooks/usePokemonDetails";
import { formatPokemonName } from "@/utils/pokemon";

function getDetailScreenOptions(name?: string) {
  return {
    title: name ? formatPokemonName(name) : "Pokémon",
    headerBackButtonDisplayMode: "minimal" as const,
    headerTransparent: true,
    headerStyle: { backgroundColor: "transparent" },
    headerTintColor: "transparent",
    headerTitleStyle: { color: COLORS.ink },
    headerShadowVisible: false,
  };
}

const detailHeaderStyle = {
  backgroundColor: "transparent" as const,
  shadowColor: "transparent" as const,
};

export default function PokemonDetailsScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const { width } = useWindowDimensions();
  const { pokemon, isLoading, error } = usePokemonDetails(name);
  const detailScreenOptions = getDetailScreenOptions(name);
  const [isShiny, setIsShiny] = useState(false);
  const [isChangingAppearance, setIsChangingAppearance] = useState(false);
  const [artworkFlip] = useState(() => new Animated.Value(0));
  const artworkRotation = artworkFlip.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-90deg", "0deg", "90deg"],
  });

  const changeAppearance = (nextIsShiny: boolean) => {
    if (
      isChangingAppearance ||
      nextIsShiny === isShiny ||
      (nextIsShiny && !pokemon?.shinyImage)
    ) {
      return;
    }

    setIsChangingAppearance(true);
    artworkFlip.setValue(0);
    Animated.timing(artworkFlip, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      setIsShiny(nextIsShiny);
      artworkFlip.setValue(-1);
      Animated.timing(artworkFlip, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setIsChangingAppearance(false));
    });
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={detailScreenOptions} />
        <Stack.Header style={detailHeaderStyle} />
        <SafeAreaView style={styles.stateScreen}>
          <ScreenMessage loading title="Loading Pokémon" message="Getting the details ready." />
        </SafeAreaView>
      </>
    );
  }

  if (error || !pokemon) {
    return (
      <>
        <Stack.Screen options={detailScreenOptions} />
        <Stack.Header style={detailHeaderStyle} />
        <SafeAreaView style={styles.stateScreen}>
          <ScreenMessage
            title="Pokémon unavailable"
            message="We couldn’t load these details. Go back and try again."
          />
        </SafeAreaView>
      </>
    );
  }

  const typeColor = POKEMON_TYPE_COLORS[pokemon.types[0]] ?? COLORS.accent;
  const image = isShiny ? pokemon.shinyImage ?? pokemon.image : pokemon.image;
  const artworkSize = Math.min(width - 72, 280);
  const totalStats = pokemon.stats.reduce((total, stat) => total + stat.value, 0);

  return (
    <>
      <Stack.Screen options={detailScreenOptions} />
      <Stack.Header style={detailHeaderStyle} />
      <SafeAreaView edges={["bottom", "left", "right"]} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>
            <View style={[styles.hero, { backgroundColor: `${typeColor}17` }]}>
              <Text style={styles.number}>#{String(pokemon.id).padStart(3, "0")}</Text>
              {image ? (
                <Animated.Image
                  accessibilityLabel={`${isShiny ? "Shiny " : ""}${formatPokemonName(pokemon.name)} artwork`}
                  source={{ uri: image }}
                  resizeMode="contain"
                  style={{
                    width: artworkSize,
                    height: artworkSize,
                    backfaceVisibility: "hidden",
                    transform: [{ perspective: 900 }, { rotateY: artworkRotation }],
                  }}
                />
              ) : null}
              <Text style={styles.name}>{formatPokemonName(pokemon.name)}</Text>
              <View style={styles.types}>
                {pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}
              </View>

              <View style={styles.appearancePicker} accessibilityRole="tablist">
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: !isShiny, disabled: isChangingAppearance }}
                  disabled={isChangingAppearance}
                  onPress={() => changeAppearance(false)}
                  style={[styles.appearanceOption, !isShiny && styles.selectedOption]}
                >
                  <Text style={[styles.appearanceText, !isShiny && styles.selectedText]}>
                    Normal
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected: isShiny,
                    disabled: !pokemon.shinyImage || isChangingAppearance,
                  }}
                  disabled={!pokemon.shinyImage || isChangingAppearance}
                  onPress={() => changeAppearance(true)}
                  style={[
                    styles.appearanceOption,
                    isShiny && styles.selectedOption,
                    !pokemon.shinyImage && styles.disabledOption,
                  ]}
                >
                  <Text style={[styles.appearanceText, isShiny && styles.selectedText]}>
                    ✦ Shiny
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.measurements}>
              <View style={styles.measurement}>
                <Text style={styles.measurementValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
                <Text style={styles.measurementLabel}>Height</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.measurement}>
                <Text style={styles.measurementValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
                <Text style={styles.measurementLabel}>Weight</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Abilities</Text>
                <Text style={styles.sectionCaption}>What it can do</Text>
              </View>
              <View style={styles.abilityList}>
                {pokemon.abilities.map((ability) => (
                  <View key={ability.name} style={styles.abilityRow}>
                    <Text style={styles.abilityName}>{formatPokemonName(ability.name)}</Text>
                    {ability.isHidden ? <Text style={styles.hiddenTag}>Hidden ability</Text> : null}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Base stats</Text>
                <Text style={styles.sectionCaption}>Total {totalStats}</Text>
              </View>
              <View style={styles.statList}>
                {pokemon.stats.map((stat) => (
                  <PokemonStatRow key={stat.name} stat={stat} color={typeColor} />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.canvas,
    flex: 1,
  },
  stateScreen: {
    backgroundColor: COLORS.canvas,
    flex: 1,
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 128,
    paddingBottom: 32,
  },
  page: {
    alignSelf: "center",
    gap: 16,
    maxWidth: 700,
    width: "100%",
  },
  hero: {
    alignItems: "center",
    borderRadius: 28,
    overflow: "hidden",
    padding: 20,
  },
  number: {
    alignSelf: "flex-end",
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  name: {
    color: COLORS.ink,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2,
  },
  types: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 10,
  },
  appearancePicker: {
    backgroundColor: "#FFFFFFB8",
    borderRadius: 15,
    flexDirection: "row",
    gap: 3,
    marginTop: 18,
    padding: 4,
  },
  appearanceOption: {
    alignItems: "center",
    borderRadius: 11,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 98,
    paddingHorizontal: 14,
  },
  selectedOption: {
    backgroundColor: COLORS.ink,
  },
  disabledOption: {
    opacity: 0.45,
  },
  appearanceText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  measurements: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 18,
  },
  measurement: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  measurementValue: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  measurementLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 36,
    width: 1,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: 15,
    padding: 18,
  },
  sectionHeading: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionCaption: {
    color: COLORS.muted,
    fontSize: 12,
  },
  abilityList: {
    gap: 9,
  },
  abilityRow: {
    alignItems: "center",
    backgroundColor: COLORS.canvas,
    borderRadius: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  abilityName: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  hiddenTag: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  statList: {
    gap: 13,
  },
});
