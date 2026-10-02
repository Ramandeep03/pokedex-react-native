import { useCallback, useEffect, useRef, useState } from "react";

import { fetchPokemonPage, searchPokemonPage } from "@/services/pokemonApi";
import type { Pokemon } from "@/types/pokemon";

export function usePokemonList(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const [activeQuery, setActiveQuery] = useState("");
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const requestVersion = useRef(0);
  const loadingMore = useRef(false);

  useEffect(() => {
    const version = ++requestVersion.current;
    const timeout = setTimeout(() => {
      setActiveQuery(normalizedQuery);
      setPokemon([]);
      setOffset(0);
      setTotalCount(0);
      setHasMore(true);
      setError(false);
      setIsLoading(true);
      setIsLoadingMore(false);
      loadingMore.current = false;

      const loadFirstPage = async () => {
        try {
          const page = normalizedQuery
            ? await searchPokemonPage(normalizedQuery, 0)
            : await fetchPokemonPage(0);
          if (version !== requestVersion.current) return;
          setPokemon(page.items);
          setOffset(page.items.length);
          setTotalCount(page.totalCount);
          setHasMore(page.hasMore);
        } catch {
          if (version === requestVersion.current) setError(true);
        } finally {
          if (version === requestVersion.current) setIsLoading(false);
        }
      };

      void loadFirstPage();
    }, normalizedQuery ? 280 : 0);

    return () => {
      clearTimeout(timeout);
      if (requestVersion.current === version) requestVersion.current += 1;
    };
  }, [normalizedQuery, retryKey]);

  const loadMore = useCallback(async () => {
    if (
      normalizedQuery !== activeQuery ||
      loadingMore.current ||
      !hasMore ||
      isLoading
    ) {
      return;
    }

    loadingMore.current = true;
    setIsLoadingMore(true);
    setError(false);
    const version = requestVersion.current;

    try {
      const page = normalizedQuery
        ? await searchPokemonPage(normalizedQuery, offset)
        : await fetchPokemonPage(offset);
      if (version !== requestVersion.current) return;
      setPokemon((current) => [...current, ...page.items]);
      setOffset((current) => current + page.items.length);
      setTotalCount(page.totalCount);
      setHasMore(page.hasMore);
    } catch {
      if (version === requestVersion.current) setError(true);
    } finally {
      if (version === requestVersion.current) {
        loadingMore.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [activeQuery, hasMore, isLoading, normalizedQuery, offset]);

  const retry = useCallback(() => {
    setRetryKey((current) => current + 1);
  }, []);

  const showingCurrentQuery = normalizedQuery === activeQuery;

  return {
    pokemon: showingCurrentQuery && !isLoading ? pokemon : [],
    totalCount: showingCurrentQuery ? totalCount : 0,
    hasMore,
    isLoading: isLoading || !showingCurrentQuery,
    isLoadingMore,
    error: showingCurrentQuery && error,
    loadMore,
    retry,
  };
}
