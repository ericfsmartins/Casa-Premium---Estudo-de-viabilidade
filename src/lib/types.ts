export interface Comparavel {
  descricao: string;
  area: number;
  preco: number;
}

export interface ProjetoInputs {
  id: string;
  nome: string;
  // Dados do imóvel
  valorLote: number;
  areaLote: number;
  areaConstruida: number;
  custoPorM2: number;
  valorVenda: number;
  precoMercado: number;
  // Financiamento
  percLTV: number;
  taxaAnual: number;
  prazoMeses: number;
  // Cronograma
  mesesPreObra: number;
  mesesObra: number;
  mesesPosA: number;
  mesesPosB: number;
  mesesPosC: number;
  // Custos fixos
  condominio: number;
  iptuAnual: number;
  // Impostos
  comissao: number;
  ir: number;
  tma: number;
  // Pré-obra
  percITBI: number;
  escrituraRegistro: number;
  projetoArquitetonico: number;
  projetosEletricoHidraulico: number;
  estruturalART: number;
  topografiaSondagem: number;
  render3D: number;
  taxasCaixaEngenharia: number;
  seguroInicial: number;
  alvaraPrefeitura: number;
  placaObra: number;
  // Durante obra
  inssObra: number;
  vistoriasBanco: number;
  habitese: number;
  averbacaoCartorio: number;
  // Comparáveis
  comparaveis: Comparavel[];
}

export interface CenarioResult {
  cenario: 'A' | 'B' | 'C';
  mesesPos: number;
  lucroLiquido: number;
  lucroBruto: number;
  irValor: number;
  custoTotal: number;
  exposicaoMaxima: number;
  roe: number;
  margem: number;
  receitaLiquida: number;
  totalPos: number;
  saldoNaVenda: number;
  duracaoTotal: number;
  tir: number;
  vpl: number;
  paybackDescontado: number;
  moic: number;
  breakEvenVGV: number;
  fluxosCaixa: number[];
}

export interface AnalyseMercado {
  mediaComps: number;
  medianaComps: number;
  minComp: number;
  maxComp: number;
  desvioPreco: number;
  alertaMercado: string;
}

export interface AuditCheck {
  label: string;
  status: 'ok' | 'warn' | 'fail';
  detail: string;
}

export interface Parecer {
  recomendacao: string;
  alertas: string[];
  positivos: string[];
  score: number;
}

export interface ProjetoCompleto {
  inputs: ProjetoInputs;
  cenarios: { A: CenarioResult; B: CenarioResult; C: CenarioResult };
  mercado: AnalyseMercado;
  parecer: Parecer;
  auditChecks: AuditCheck[];
  totalPreObra: number;
  totalDuranteObra: number;
  custoTotalConstrucao: number;
  valorFinanciado: number;
  jurosObra: number;
  pmt: number;
}
