export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  trending: boolean;
}

export const categories = [
  "Designer Sarees",
  "Wedding Lehengas",
  "Ethnic Suits",
  "Western Dresses",
  "Party Gowns",
  "Co-ord Sets",
  "Luxury Loungewear",
  "Winter Collection"
];

export const products: Product[] = [];
