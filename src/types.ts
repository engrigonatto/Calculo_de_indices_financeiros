export interface FinancialData {
  year: number;
  currentAssets: number; // Ativo Circulante
  longTermReceivables: number; // Realizável a Longo Prazo
  permanentAssets: number; // Ativo Permanente (Imobilizado)
  inventories: number; // Estoque
  currentLiabilities: number; // Passivo Circulante
  longTermLiabilities: number; // Exigível a Longo Prazo
  equity: number; // Patrimônio Líquido
}

export interface FinancialRatios {
  year: number;
  ilc: number; // Índice de Liquidez Corrente
  ilg: number; // Índice de Liquidez Geral
  isg: number; // Índice de Solvência Geral
  ige: number; // Índice de Grau de Endividamento
  gct: number; // Garantia de Capital de Terceiros
  cgp: number; // Capital de Giro Próprio
  ccl: number; // Capital Circulante Líquido
  cclPercent: number; // CCL / Ativo Total (%)
  plPercent: number; // Patrimônio Líquido / Ativo Total (%)
  totalAssets: number; // Ativo Total (Calculado)
  totalLiabilities: number; // Passivo Total (Calculado)
  equity: number; // Patrimônio Líquido
}

export const initialFinancialData: FinancialData = {
  year: new Date().getFullYear(),
  currentAssets: 0,
  longTermReceivables: 0,
  permanentAssets: 0,
  inventories: 0,
  currentLiabilities: 0,
  longTermLiabilities: 0,
  equity: 0,
};

export function calculateRatios(data: FinancialData): FinancialRatios {
  const {
    year,
    currentAssets,
    longTermReceivables,
    permanentAssets,
    inventories,
    currentLiabilities,
    longTermLiabilities,
    equity,
  } = data;

  const totalAssets = currentAssets + longTermReceivables + permanentAssets + inventories;
  const totalDebt = currentLiabilities + longTermLiabilities;
  const totalLiabilities = totalDebt + equity;

  return {
    year,
    ilc: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
    ilg: totalDebt > 0 ? (currentAssets + longTermReceivables) / totalDebt : 0,
    isg: totalDebt > 0 ? totalAssets / totalDebt : 0,
    ige: totalAssets > 0 ? totalDebt / totalAssets : 0,
    gct: totalDebt > 0 ? equity / totalDebt : 0,
    cgp: equity - (longTermReceivables + permanentAssets),
    ccl: currentAssets - currentLiabilities,
    cclPercent: totalAssets > 0 ? ((currentAssets - currentLiabilities) / totalAssets) * 100 : 0,
    plPercent: totalAssets > 0 ? (equity / totalAssets) * 100 : 0,
    totalAssets,
    totalLiabilities,
    equity,
  };
}
