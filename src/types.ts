export interface Friend {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  splits: Record<string, number>; // friendId -> amount owed
}

export interface Receipt {
  id: string;
  name: string;
  expectedTotal: number;
  taxPercentage: number;
  items: Item[];
}

export interface Project {
  id: string;
  name: string;
  date: string;
  friends: Friend[];
  receipts: Receipt[];
  tags?: string[];
}
