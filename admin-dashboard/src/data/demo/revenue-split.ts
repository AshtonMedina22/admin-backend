export type RevenueReconciliationStatus = "finalized" | "pending_reconciliation";

export interface RevenueSplitMonth {
  month: string;
  solar2sk: number;
  solar3k: number;
  yellowStar: number;
  status: RevenueReconciliationStatus;
  statusNote?: string;
}

export const revenueSplitData: RevenueSplitMonth[] = [
  {
    month: "Q1-26",
    solar2sk: 60400,
    solar3k: 135000,
    yellowStar: 37500,
    status: "finalized",
    statusNote: "QuickBooks close confirmed - workbook locked",
  },
  {
    month: "Q2-26",
    solar2sk: 85500,
    solar3k: 195400,
    yellowStar: 46500,
    status: "finalized",
    statusNote: "Cross-entity journal entries posted",
  },
  {
    month: "Current Month",
    solar2sk: 31200,
    solar3k: 71000,
    yellowStar: 17500,
    status: "pending_reconciliation",
    statusNote: "Cedar Grid Assets yield accrual pending - workbook row 14 formula mismatch",
  },
];

export const totalCombinedRevenue = revenueSplitData.reduce((sum, m) => sum + m.solar2sk + m.solar3k + m.yellowStar, 0);

export const pendingReconciliationCount = revenueSplitData.filter((m) => m.status === "pending_reconciliation").length;
