export interface NiboValue {
  id: number;
  title: string;
  shortName: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  iconName: string;
}

export type ChocolateStatus = "fila" | "falando" | "entregue" | "ausente";

export interface ChocolateEntry {
  id: string;
  order: number;
  editionId?: string;  // e.g. "edition-2026-08", "edition-2026-07"
  giver: string;       // "De:"
  receiver: string;    // "Para:"
  valueIds: number[];  // [1, 2, 3...]
  notes?: string;      // Optional kudos/reason
  status: ChocolateStatus;
  createdAt: string;
  presentedAt?: string;
  speechGenerated?: string;
}

export interface MeetingEdition {
  id: string;
  name: string;
  monthYear: string;   // e.g. "08/2026"
  date: string;
  status: "active" | "completed" | "draft";
  entriesCount?: number;
}

export interface PersonRanking {
  name: string;
  receivedCount: number;
  givenCount: number;
  topValueIds: number[];
  chocolates: ChocolateEntry[];
}
