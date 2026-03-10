export interface CostItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export interface LaborItem {
  id: string;
  name: string;
  rate: number;
  time: number; // in hours or per batch
  total: number;
}

export interface OverheadItem {
  id: string;
  name: string;
  cost: number;
}

export interface HPPState {
  productName: string;
  yield: number;
  ingredients: CostItem[];
  packaging: CostItem[];
  labor: LaborItem[];
  overhead: OverheadItem[];
  margin: number; // percentage
}
