export type StockStatus = "Healthy" | "Low Stock" | "Critical";

export interface InventorySku {
  id: string;
  sku: string;
  componentName: string;
  supplier: string;
  stockLevel: number;
  reorderPoint: number;
  connectedOrderVolume: number;
  status: StockStatus;
}

export const inventoryData: InventorySku[] = [
  {
    id: "inv-001",
    sku: "INV-3KW-ANENJI",
    componentName: "Anenji 3KW Hybrid Inverter",
    supplier: "Rich Solar",
    stockLevel: 42,
    reorderPoint: 15,
    connectedOrderVolume: 8,
    status: "Healthy",
  },
  {
    id: "inv-002",
    sku: "BAT-LIFEPO4-5K",
    componentName: "48V 100Ah LiFePO4 Battery Pack",
    supplier: "Battery Supply Co",
    stockLevel: 8,
    reorderPoint: 12,
    connectedOrderVolume: 5,
    status: "Low Stock",
  },
  {
    id: "inv-003",
    sku: "RS-3KW-PANEL",
    componentName: "Rich Solar 3KW Panel Kit",
    supplier: "Rich Solar",
    stockLevel: 28,
    reorderPoint: 10,
    connectedOrderVolume: 6,
    status: "Healthy",
  },
  {
    id: "inv-004",
    sku: "MC4-CONNECT-50",
    componentName: "MC4 Connector Pack (50pc)",
    supplier: "Solar Parts Direct",
    stockLevel: 3,
    reorderPoint: 10,
    connectedOrderVolume: 2,
    status: "Critical",
  },
  {
    id: "inv-005",
    sku: "RACK-ROOF-STD",
    componentName: "Standard Roof Mount Rack Set",
    supplier: "IronRidge",
    stockLevel: 18,
    reorderPoint: 8,
    connectedOrderVolume: 4,
    status: "Healthy",
  },
];
