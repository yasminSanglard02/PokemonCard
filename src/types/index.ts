export type PokemonType =
  | "Fire" | "Water" | "Grass" | "Electric" | "Psychic"
  | "Ice" | "Dragon" | "Dark" | "Steel" | "Normal"
  | "Fighting" | "Flying" | "Poison" | "Ground" | "Rock"
  | "Bug" | "Ghost" | "Fairy";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Ultra Rare";

export interface Card {
  id: string;
  name: string;
  type: PokemonType;
  hp: number;
  attack: string;
  description: string;
  imageUrl: string;
  rarity: Rarity;
  createdAt: string;
}

export interface CardFormData {
  name: string;
  type: PokemonType;
  hp: number;
  attack: string;
  description: string;
  imageUrl: string;
  rarity: Rarity;
}