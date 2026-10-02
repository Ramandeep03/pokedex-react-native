export interface Pokemon {
  id: number;
  name: string;
  image: string | null;
  shinyImage: string | null;
  types: string[];
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonPage {
  items: Pokemon[];
  hasMore: boolean;
  totalCount: number;
}
