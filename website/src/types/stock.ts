export interface Stock {
  id: string;
  name: string;
  fullName: string;
  ticker: string;
  sector: string;
  category: string;
  price: number;
  change: number;
  changePct: number;
  high52w: number;
  low52w: number;
  initials: string;
  color: string;
  description: string;
  fundamentalsUrl: string;
  fundamentalsJson: Record<string, string>;
  logoUrl: string;
}
