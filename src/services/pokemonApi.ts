import { POKEMON_PAGE_SIZE } from "@/constants/pokemon";
import type { Pokemon, PokemonPage } from "@/types/pokemon";

const POKE_API = "https://pokeapi.co/api/v2";
const pokemonCache = new Map<string, Pokemon>();
const pendingPokemonRequests = new Map<string, Promise<Pokemon>>();
let pokemonNameIndexPromise: Promise<string[]> | null = null;

interface PokemonListResponse {
  count: number;
  next: string | null;
  results: { name: string }[];
}

interface PokemonApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  types: { type: { name: string } }[];
  abilities: {
    ability: { name: string };
    is_hidden: boolean;
  }[];
  stats: { stat: { name: string }; base_stat: number }[];
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${POKE_API}${path}`);
  if (!response.ok) {
    throw new Error(`Pokémon request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function requestPokemon(name: string): Promise<Pokemon> {
  const data = await request<PokemonApiResponse>(
    `/pokemon/${encodeURIComponent(name)}`,
  );
  const artwork = data.sprites.other?.["official-artwork"];

  const pokemon: Pokemon = {
    id: data.id,
    name: data.name,
    image: artwork?.front_default ?? data.sprites.front_default,
    shinyImage: artwork?.front_shiny ?? data.sprites.front_shiny,
    types: data.types.map(({ type }) => type.name),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map(({ ability, is_hidden }) => ({
      name: ability.name,
      isHidden: is_hidden,
    })),
    stats: data.stats.map(({ stat, base_stat }) => ({
      name: stat.name,
      value: base_stat,
    })),
  };

  pokemonCache.set(pokemon.name, pokemon);
  pokemonCache.set(String(pokemon.id), pokemon);
  return pokemon;
}

export function fetchPokemon(name: string): Promise<Pokemon> {
  const key = name.toLowerCase();
  const cachedPokemon = pokemonCache.get(key);
  if (cachedPokemon) return Promise.resolve(cachedPokemon);

  const pendingRequest = pendingPokemonRequests.get(key);
  if (pendingRequest) return pendingRequest;

  const requestPromise = requestPokemon(key).finally(() => {
    pendingPokemonRequests.delete(key);
  });
  pendingPokemonRequests.set(key, requestPromise);
  return requestPromise;
}

export async function fetchPokemonPage(offset: number): Promise<PokemonPage> {
  const page = await request<PokemonListResponse>(
    `/pokemon?limit=${POKEMON_PAGE_SIZE}&offset=${offset}`,
  );
  const items = await Promise.all(page.results.map(({ name }) => fetchPokemon(name)));

  return { items, hasMore: page.next !== null, totalCount: page.count };
}

function fetchPokemonNameIndex(): Promise<string[]> {
  if (!pokemonNameIndexPromise) {
    pokemonNameIndexPromise = request<PokemonListResponse>("/pokemon?limit=1")
      .then(({ count }) => request<PokemonListResponse>(`/pokemon?limit=${count}`))
      .then(({ results }) => results.map(({ name }) => name))
      .catch((error: unknown) => {
        pokemonNameIndexPromise = null;
        throw error;
      });
  }

  return pokemonNameIndexPromise;
}

export async function searchPokemonPage(
  query: string,
  offset: number,
): Promise<PokemonPage> {
  const normalizedQuery = query.trim().toLowerCase();
  const allNames = await fetchPokemonNameIndex();
  const matchingNames = allNames.filter((name) => name.includes(normalizedQuery));
  const namesOnPage = matchingNames.slice(offset, offset + POKEMON_PAGE_SIZE);
  const items = await Promise.all(namesOnPage.map((name) => fetchPokemon(name)));

  return {
    items,
    hasMore: offset + items.length < matchingNames.length,
    totalCount: matchingNames.length,
  };
}
