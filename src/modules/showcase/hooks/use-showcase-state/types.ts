export interface ShowcaseState {
  counter: number;
  favorites: string[];
  increment: () => void;
  reset: () => void;
  toggleFavorite: (id: string) => void;
}
