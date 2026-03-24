export interface Comparavel {
  descricao: string;
  area: number;
  preco: number;
}

export type ModalidadeFinanciamento = 'terreno_construcao' | 'so_construcao';

export interface ProjetoInputs {
  id: string;
  nome: string;
  modalidadeFinanciamento: ModalidadeFinanciamento;
  valorLote: number;
  areaLote: number;
  areaConstruida: number;
  custoPorM2: number;
  valorVenda: number;
  precoMercado: number;
  percLTV: number;
  taxaAnual: number;
  prazoMeses: number;
  mesesPreObra: number;
  mesesObra: number;
  mesesPosA: number;
  mesesPosB: number;
  mesesPosC: number;
  condominio: number;
  iptuAnual: number;
  comissao: number;
  ir: number;
  tma: number;
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
  inssObra: number;
  vistoriasBanco: number;
  habitese: number;
  averbacaoCartorio: number;
  comparaveis: Comparavel[];
}

export interface JurosObraMes {
  mes: number;
  liberacao: number;
  saldo: number;
  juros: number;
}

export interface FluxoCaixaMes {
  mes: number;
  fase: string;
  custoEquity: number;
  liberacaoBanco: number;
  juros: number;
  pmtPos: number;
  vendaIRQuit: number;
  fluxoLiquido: number;
  acumulado: number;
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
  carregoPos: number;
  prestacoesPagas: number;
  fluxoDetalhado: FluxoCaixaMes[];
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
  cronogramaJuros: JurosObraMes[];
  totalPreObra: number;
  totalDuranteObra: number;
  custoTotalConstrucao: number;
  valorFinanciado: number;
  jurosObra: number;
  pmt: number;
}
