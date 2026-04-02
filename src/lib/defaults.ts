import { ProjetoInputs, ChecklistFase, ChecklistItem, TerrenoInfo } from './types';
import { v4Fallback } from './utils-id';

function mkId() { return v4Fallback(); }

export function criarTerrenoPadrao(): TerrenoInfo {
  return {
    endereco: '',
    bairro: '',
    cidade: 'Cuiabá',
    matricula: '',
    topografia: 'plano',
    zoneamento: 'ZR1',
    testada: 0,
    profundidade: 0,
    recuoFrontal: 5,
    recuoLateral: 1.5,
    recuoFundos: 3,
    infraAgua: true,
    infraEsgoto: false,
    infraPavimentacao: true,
    infraCalcada: false,
    infraEletrica: true,
    infraGas: false,
    situacaoDocumental: 'pendente',
    confrontanteFrente: '',
    confrontanteFundos: '',
    confrontanteEsquerda: '',
    confrontanteDireita: '',
    observacoes: '',
  };
}

function mkItem(texto: string): ChecklistItem {
  return {
    id: mkId(),
    texto,
    status: 'pendente',
    responsavel: '',
    prazo: '',
    nota: '',
  };
}

export function criarChecklistPadrao(): ChecklistFase[] {
  return [
    {
      id: mkId(),
      nome: 'Aquisição',
      icone: '🏠',
      itens: [
        mkItem('Venda do terreno no Belvedere II'),
      ],
    },
    {
      id: mkId(),
      nome: 'Projeto/Aprovações',
      icone: '📐',
      itens: [],
    },
    {
      id: mkId(),
      nome: 'Regularização de Obra',
      icone: '🏗️',
      itens: [],
    },
    {
      id: mkId(),
      nome: 'Conclusão',
      icone: '✅',
      itens: [],
    },
  ];
}

export function criarProjetoPadrao(nome = 'Casa Alpha'): ProjetoInputs {
  return {
    id: v4Fallback(),
    nome,
    modalidadeFinanciamento: 'terreno_construcao',
    valorLote: 480000,
    areaLote: 300,
    areaConstruida: 250,
    custoPorM2: 5500,
    valorVenda: 2800000,
    precoMercado: 11000,
    percLTV: 0.80,
    taxaAnual: 0.118,
    prazoMeses: 360,
    mesesPreObra: 4,
    mesesObra: 12,
    mesesPosA: 1,
    mesesPosB: 6,
    mesesPosC: 12,
    condominio: 800,
    iptuAnual: 5000,
    comissao: 0.05,
    ir: 0.15,
    tma: 0.18,
    percITBI: 0.02,
    escrituraRegistro: 12246.69,
    projetoArquitetonico: 10972.50,
    projetosEletricoHidraulico: 4987.50,
    estruturalART: 4000,
    topografiaSondagem: 500,
    render3D: 1500,
    taxasCaixaEngenharia: 8500,
    seguroInicial: 5000,
    alvaraPrefeitura: 1812.09,
    placaObra: 200,
    inssObra: 29000,
    vistoriasBanco: 1500,
    habitese: 375.90,
    averbacaoCartorio: 1300,
    comparaveis: [
      { descricao: 'Florais do Parque — OLX 1', area: 283, preco: 2950000 },
      { descricao: 'Florais do Parque — OLX 2', area: 233, preco: 2790000 },
      { descricao: 'Florais/Morada Nobres', area: 279, preco: 2600000 },
      { descricao: 'Sobrado Florais', area: 306, preco: 2950000 },
    ],
    terreno: criarTerrenoPadrao(),
    riscos: [
      {
        id: mkId(),
        categoria: 'Mercado/Vendas',
        descricao: 'Necessidade de queima do imóvel.',
        probabilidade: 0.10,
        impacto: 'Alto',
        mitigacao: 'Precificação correta.',
        responsavel: 'Eric Martins',
        status: 'Aberto',
        score: 0.3,
      },
    ],
    checklist: criarChecklistPadrao(),
    decisoes: [],
    mercadoTendencia: 'estavel',
    mercadoPerfil: 'familia',
  };
}
