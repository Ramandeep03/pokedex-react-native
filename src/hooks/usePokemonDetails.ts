import { useEffect, useState } from "react";

import { fetchPokemon } from "@/services/pokemonApi";
import type { Pokemon } from "@/types/pokemon";

export function usePokemonDetails(name?: string) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      if (!name) {
        setError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(false);

      try {
        const result = await fetchPokemon(name);
        if (isCurrent) setPokemon(result);
      } catch {
        if (isCurrent) setError(true);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadPokemon();
    return () => {
      isCurrent = false;
    };
  }, [name]);

  return { pokemon, isLoading, error };
}
