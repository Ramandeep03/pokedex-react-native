export function formatPokemonName(name: string): string {
  return name
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
