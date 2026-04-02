export interface Comparavel {
  descricao: string;
  area: number;
  preco: number;
}

export interface TipoUnidade {
  id: string;
  descricao: string;
  area: number;
  precoVenda: number;
  quantidade: number;
}

export type ModalidadeFinanciamento = 'terreno_construcao' | 'so_construcao' | 'apoio_producao' | 'plano_empresario';

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
  unidades?: TipoUnidade[];
  mesesCarencia?: number;
  // Módulos opcionais
  terreno?: TerrenoInfo;
  riscos?: RiscoItem[];
  checklist?: ChecklistFase[];
  decisoes?: DecisaoComite[];
  // Mercado expandido
  mercadoTendencia?: 'subindo' | 'estavel' | 'caindo';
  mercadoPerfil?: 'familia' | 'investidor' | 'permutante' | 'misto';
}

// ─────────────────────────────────────────────────────────────────
// TERRENO
// ─────────────────────────────────────────────────────────────────
export type Topografia = 'plano' | 'aclive' | 'declive' | 'irregular';
export type SituacaoDocumental = 'ok' | 'pendente' | 'com_onus';
export type Zoneamento = 'ZR1' | 'ZR2' | 'ZR3' | 'ZM' | 'ZC' | 'ZI' | 'outro';

export interface TerrenoInfo {
  endereco: string;
  bairro: string;
  cidade: string;
  matricula: string;
  topografia: Topografia;
  zoneamento: Zoneamento;
  testada: number;
  profundidade: number;
  recuoFrontal: number;
  recuoLateral: number;
  recuoFundos: number;
  /// Infraestrutura
  infraAgua: boolean;
  infraEsgoto: boolean;
  infraPavimentacao: boolean;
  infraCalcada: boolean;
  infraEletrica: boolean;
  infraGas: boolean;
  /// Situação documental
  situacaoDocumental: SituacaoDocumental;
  /// Confrontantes
  confrontanteFrente: string;
  confrontanteFundos: string;
  confrontanteEsquerda: string;
  confrontanteDireita: string;
  /// Observações
  observacoes: string;
}

// ─────────────────────────────────────────────────────────────────
// RISCOS
// ─────────────────────────────────────────────────────────────────
export type RiscoCategoria =
  | 'Mercado/Vendas'
  | 'Construção'
  | 'Financeiro'
  | 'Jurídico'
  | 'Ambiental'
  | 'Prazo';

export type RiscoImpacto = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
export type RiscoStatus = 'Aberto' | 'Mitigado' | 'Aceito';

export interface RiscoItem {
  id: string;
  categoria: RiscoCategoria;
  descricao: string;
  probabilidade: number; // 0.0 – 1.0 (p.ex. 0.1 = 10%)
  impacto: RiscoImpacto;
  mitigacao: string;
  responsavel: string;
  status: RiscoStatus;
  score: number; // calculado: probabilidade × impactoNum
}

export const IMPACTO_NUM: Record<RiscoImpacto, number> = {
  Baixo: 1,
  Médio: 3,
  Alto: 6,
  Crítico: 10,
};

// ─────────────────────────────────────────────────────────────────
// CHECKLIST
// ─────────────────────────────────────────────────────────────────
export type ChecklistStatus = 'pendente' | 'em_progresso' | 'critico' | 'concluido';

export interface ChecklistItem {
  id: string;
  texto: string;
  status: ChecklistStatus;
  responsavel: string;
  prazo: string; // ISO date string
  nota: string;
}

export interface ChecklistFase {
  id: string;
  nome: string;
  icone: string;
  itens: ChecklistItem[];
}

// ─────────────────────────────────────────────────────────────────
// COMITÊ
// ─────────────────────────────────────────────────────────────────
export type DecisaoTipo = 'comprar' | 'renegociar' | 'ajustar' | 'reprovar';

export interface DecisaoComite {
  id: string;
  tipo: DecisaoTipo;
  justificativa: string;
  dataDecisao: string; // ISO string
  decisorNome: string;
}

// ─────────────────────────────────────────────────────────────────
// RESULTADOS FINANCEIROS
// ─────────────────────────────────────────────────────────────────
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

export interface ScoreFator {
  label: string;
  descricao: string;
  pontos: number;
  maxPontos: number;
}

export interface AnalyseMercado {
  mediaComps: number;
  medianaComps: number;
  minComp: number;
  maxComp: number;
  desvioPreco: number;
  alertaMercado: string;
  desvioPadrao: number;
  scoreLiquidez: number; // 0–100
  alertaLiquidez: string;
  diasGiroEstimado: number;
  scoreFactors: ScoreFator[];
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

export interface EstrategiaCompra {
  tipo: 'avista' | 'parcelamento' | 'permuta';
  titulo: string;
  subtitulo: string;
  valorTotal: number;
  entrada: number;
  saldoFinanciado: number;
  parcelas: number;
  valorParcela: number;
  custoTotal: number;
  permutaValor: number;
  dinheiroValor: number;
  roe: number;
  margem: number;
  lucroLiquido: number;
  equity: number;
  equityDelta: number;
  recomendado: boolean;
  atendemMetas: boolean;
  desconto: number;
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
  estrategiasCompra: EstrategiaCompra[];
}
