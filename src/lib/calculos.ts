import { ProjetoInputs, CenarioResult, AnalyseMercado, Parecer, AuditCheck, ProjetoCompleto, JurosObraMes, FluxoCaixaMes } from './types';

export function calcularJurosObra(valorFinanciado: number, taxaMensal: number, mesesObra: number): number {
  let saldo = 0, totalJuros = 0;
  for (let i = 1; i <= mesesObra; i++) {
    saldo += valorFinanciado / mesesObra;
    totalJuros += saldo * taxaMensal;
  }
  return totalJuros;
}

export function gerarCronogramaJuros(valorFinanciado: number, taxaAnual: number, mesesObra: number): JurosObraMes[] {
  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  return Array.from({ length: mesesObra }, (_, idx) => {
    const mes = idx + 1;
    const saldo = valorFinanciado * (mes / mesesObra);
    const juros = saldo * i;
    return { mes, liberacao: valorFinanciado / mesesObra, saldo, juros };
  });
}

export function calcSaldoDevedor(pv: number, rateAnual: number, n: number, k: number): number {
  const i = Math.pow(1 + rateAnual, 1 / 12) - 1;
  const pmt = pv * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  return pv * Math.pow(1 + i, k) - pmt * (Math.pow(1 + i, k) - 1) / i;
}

function somaPreObra(p: ProjetoInputs): number {
  const itbi = p.valorLote * p.percITBI;
  return itbi + p.escrituraRegistro + p.projetoArquitetonico + p.projetosEletricoHidraulico
    + p.estruturalART + p.topografiaSondagem + p.render3D + p.taxasCaixaEngenharia
    + p.seguroInicial + p.alvaraPrefeitura + p.placaObra;
}

function somaDuranteObra(p: ProjetoInputs): number {
  return p.inssObra + p.vistoriasBanco + p.habitese + p.averbacaoCartorio;
}

export function calcularVPL(fluxos: number[], tma: number): number {
  const txMensal = Math.pow(1 + tma, 1 / 12) - 1;
  return fluxos.reduce((acc, fc, i) => acc + fc / Math.pow(1 + txMensal, i), 0);
}

export function calcularTIR(fluxos: number[]): number {
  let rate = 0.01;
  for (let iter = 0; iter < 200; iter++) {
    let npv = 0, dnpv = 0;
    for (let i = 0; i < fluxos.length; i++) {
      const d = Math.pow(1 + rate, i);
      npv += fluxos[i] / d;
      dnpv -= i * fluxos[i] / Math.pow(1 + rate, i + 1);
    }
    if (Math.abs(dnpv) < 1e-12) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-10) { rate = newRate; break; }
    rate = newRate;
    if (rate < -0.99) rate = -0.5;
    if (rate > 10) rate = 5;
  }
  return Math.pow(1 + rate, 12) - 1;
}

function construirFluxos(p: ProjetoInputs, mesesPos: number,
  custoTotalConstrucao: number, valorFinanciado: number,
  totalPreObraSoftCosts: number, totalDuranteObraHard: number,
  taxaMensal: number, pmt: number, jurosObra: number,
  vgvEfetivo: number): number[] {

  const carregoMensal = p.condominio + p.iptuAnual / 12;
  const fluxos: number[] = [];

  const isSC = p.modalidadeFinanciamento === 'so_construcao';
  // In T+C mode, bank releases land portion at month 0
  const bankLandRelease = isSC ? 0 : p.valorLote * p.percLTV;
  const valorFinanciadoObra = valorFinanciado - bankLandRelease;

  // Mês 0: terreno (equity portion = total - bank release)
  fluxos.push(-(p.valorLote - bankLandRelease));

  // Pré-obra
  const preObraMensal = totalPreObraSoftCosts / Math.max(1, p.mesesPreObra);
  for (let i = 0; i < p.mesesPreObra; i++) {
    fluxos.push(-preObraMensal - carregoMensal);
  }

  // Obra — only construction portion released in tranches
  const construcaoMensal = custoTotalConstrucao / Math.max(1, p.mesesObra);
  const libMensal = valorFinanciadoObra / Math.max(1, p.mesesObra);
  let saldoObra = bankLandRelease; // bank already released land portion
  const hardMensal = totalDuranteObraHard / Math.max(1, p.mesesObra);
  for (let i = 0; i < p.mesesObra; i++) {
    saldoObra += libMensal;
    const jurosMes = saldoObra * taxaMensal;
    fluxos.push(-construcaoMensal + libMensal - jurosMes - carregoMensal - hardMensal);
  }

  // Pós-obra
  for (let i = 0; i < mesesPos; i++) {
    fluxos.push(-pmt - carregoMensal);
  }

  // Venda no último mês
  const kParcelas = mesesPos;
  const saldoDevedor = calcSaldoDevedor(valorFinanciado, p.taxaAnual, p.prazoMeses, kParcelas);
  const comissaoVal = vgvEfetivo * p.comissao;

  const carregoTotal = carregoMensal * (p.mesesPreObra + p.mesesObra + mesesPos);
  const custoTotalAll = p.valorLote + custoTotalConstrucao + totalPreObraSoftCosts + totalDuranteObraHard
    + jurosObra + carregoTotal + pmt * mesesPos;
  const recLiq = vgvEfetivo - comissaoVal;
  const lucroBruto = recLiq - custoTotalAll;
  const irVal = Math.max(0, lucroBruto) * p.ir;

  const vendaNet = vgvEfetivo - comissaoVal - irVal - saldoDevedor;
  fluxos[fluxos.length - 1] += vendaNet;

  return fluxos;
}

function construirFluxoDetalhado(p: ProjetoInputs, mesesPos: number,
  custoTotalConstrucao: number, valorFinanciado: number,
  totalPreObraSoftCosts: number, totalDuranteObraHard: number,
  taxaMensal: number, pmt: number, jurosObra: number,
  vgvEfetivo: number): FluxoCaixaMes[] {

  const carregoMensal = p.condominio + p.iptuAnual / 12;
  const result: FluxoCaixaMes[] = [];
  let acum = 0;

  // Mês 0
  const f0 = -p.valorLote;
  acum += f0;
  result.push({ mes: 0, fase: 'Compra', custoEquity: -p.valorLote, liberacaoBanco: 0, juros: 0, pmtPos: 0, vendaIRQuit: 0, fluxoLiquido: f0, acumulado: acum });

  // Pré-obra
  const preObraMensal = totalPreObraSoftCosts / Math.max(1, p.mesesPreObra);
  for (let i = 0; i < p.mesesPreObra; i++) {
    const custo = -(preObraMensal + carregoMensal);
    acum += custo;
    result.push({ mes: i + 1, fase: 'Pré-Obra', custoEquity: custo, liberacaoBanco: 0, juros: 0, pmtPos: 0, vendaIRQuit: 0, fluxoLiquido: custo, acumulado: acum });
  }

  // Obra
  const construcaoMensal = custoTotalConstrucao / Math.max(1, p.mesesObra);
  const libMensal = valorFinanciado / Math.max(1, p.mesesObra);
  const hardMensal = totalDuranteObraHard / Math.max(1, p.mesesObra);
  let saldoObra = 0;
  for (let i = 0; i < p.mesesObra; i++) {
    saldoObra += libMensal;
    const jurosMes = saldoObra * taxaMensal;
    const custoEq = -(construcaoMensal + carregoMensal + hardMensal);
    const fliq = custoEq + libMensal - jurosMes;
    acum += fliq;
    result.push({
      mes: p.mesesPreObra + i + 1, fase: 'Obra',
      custoEquity: custoEq, liberacaoBanco: libMensal, juros: -jurosMes,
      pmtPos: 0, vendaIRQuit: 0, fluxoLiquido: fliq, acumulado: acum
    });
  }

  // Pós-obra
  const kParcelas = mesesPos;
  const saldoDevedor = calcSaldoDevedor(valorFinanciado, p.taxaAnual, p.prazoMeses, kParcelas);
  const comissaoVal = vgvEfetivo * p.comissao;
  const carregoTotal = carregoMensal * (p.mesesPreObra + p.mesesObra + mesesPos);
  const custoTotalAll = p.valorLote + custoTotalConstrucao + totalPreObraSoftCosts + totalDuranteObraHard
    + jurosObra + carregoTotal + pmt * mesesPos;
  const recLiq = vgvEfetivo - comissaoVal;
  const lucroBruto = recLiq - custoTotalAll;
  const irVal = Math.max(0, lucroBruto) * p.ir;
  const vendaNet = vgvEfetivo - comissaoVal - irVal - saldoDevedor;

  for (let i = 0; i < mesesPos; i++) {
    const mesNum = p.mesesPreObra + p.mesesObra + i + 1;
    const isLast = i === mesesPos - 1;
    const fliq = -pmt - carregoMensal + (isLast ? vendaNet : 0);
    acum += fliq;
    result.push({
      mes: mesNum, fase: 'Pós-Obra',
      custoEquity: -carregoMensal, liberacaoBanco: 0, juros: 0,
      pmtPos: -pmt, vendaIRQuit: isLast ? vendaNet : 0,
      fluxoLiquido: fliq, acumulado: acum
    });
  }

  return result;
}

function calcularCenario(
  p: ProjetoInputs, cenarioLabel: 'A' | 'B' | 'C', mesesPos: number,
  custoTotalConstrucao: number, valorFinanciado: number,
  totalPreObraSoftCosts: number, totalDuranteObraHard: number,
  taxaMensal: number, pmt: number, jurosObra: number, vgvEfetivo: number
): CenarioResult {
  const carregoMensal = p.condominio + p.iptuAnual / 12;
  const carregoPre = carregoMensal * p.mesesPreObra;
  const carregoDuranteObra = carregoMensal * p.mesesObra;
  const carregoPos = carregoMensal * mesesPos;
  const prestacoesPagas = pmt * mesesPos;
  const totalPos = carregoPos + prestacoesPagas;

  const totalPreObra = totalPreObraSoftCosts + carregoPre;
  const totalDuranteObra = totalDuranteObraHard + carregoDuranteObra + jurosObra;

  const custoTotal = totalPreObra + p.valorLote + custoTotalConstrucao + totalDuranteObra + totalPos;

  const receitaLiquida = vgvEfetivo * (1 - p.comissao);
  const lucroBruto = receitaLiquida - custoTotal;
  const baseIR = Math.max(0, lucroBruto);
  const irValor = baseIR * p.ir;
  const lucroLiquido = lucroBruto - irValor;

  // Build cash flows
  const fluxosCaixa = construirFluxos(p, mesesPos, custoTotalConstrucao, valorFinanciado,
    totalPreObraSoftCosts, totalDuranteObraHard, taxaMensal, pmt, jurosObra, vgvEfetivo);

  // Exposição = pico negativo do fluxo acumulado (equity invested)
  // No mês da venda, o investidor paga PMT+carrego ANTES de receber a venda,
  // então separamos outflow e inflow do último mês para capturar o pico real.
  const carregoMensalExp = p.condominio + p.iptuAnual / 12;
  let acum = 0;
  let picoNeg = 0;
  for (let i = 0; i < fluxosCaixa.length; i++) {
    if (i === fluxosCaixa.length - 1 && mesesPos > 0) {
      // Último mês: primeiro debita outflow, mede pico, depois credita venda
      const outflow = -pmt - carregoMensal;
      acum += outflow;
      if (acum < picoNeg) picoNeg = acum;
      acum += fluxosCaixa[i] - outflow; // restante = venda líquida
    } else {
      acum += fluxosCaixa[i];
      if (acum < picoNeg) picoNeg = acum;
    }
  }
  const exposicaoMaxima = Math.abs(picoNeg);

  const roe = exposicaoMaxima > 0 ? lucroLiquido / exposicaoMaxima : 0;
  const margem = vgvEfetivo > 0 ? lucroLiquido / vgvEfetivo : 0;
  const duracaoTotal = p.mesesPreObra + p.mesesObra + mesesPos;

  const kParcelas = mesesPos;
  const saldoNaVenda = calcSaldoDevedor(valorFinanciado, p.taxaAnual, p.prazoMeses, kParcelas);
  const moic = exposicaoMaxima > 0 ? (exposicaoMaxima + lucroLiquido) / exposicaoMaxima : 0;

  const tir = calcularTIR(fluxosCaixa);
  const vpl = calcularVPL(fluxosCaixa, p.tma);

  // Payback descontado
  const txMensalTMA = Math.pow(1 + p.tma, 1 / 12) - 1;
  let acumPB = 0, paybackDescontado = duracaoTotal;
  for (let i = 0; i < fluxosCaixa.length; i++) {
    acumPB += fluxosCaixa[i] / Math.pow(1 + txMensalTMA, i);
    if (acumPB >= 0) { paybackDescontado = i; break; }
  }

  // Break-even VGV
  let lo = 0, hi = vgvEfetivo * 2;
  for (let iter = 0; iter < 50; iter++) {
    const mid = (lo + hi) / 2;
    const rl = mid * (1 - p.comissao);
    const lb = rl - custoTotal;
    const irv = Math.max(0, lb) * p.ir;
    const ll = lb - irv;
    if (ll < 0) lo = mid; else hi = mid;
  }
  const breakEvenVGV = (lo + hi) / 2;

  // Fluxo detalhado
  const fluxoDetalhado = construirFluxoDetalhado(p, mesesPos, custoTotalConstrucao, valorFinanciado,
    totalPreObraSoftCosts, totalDuranteObraHard, taxaMensal, pmt, jurosObra, vgvEfetivo);

  return {
    cenario: cenarioLabel, mesesPos, lucroLiquido, lucroBruto, irValor, custoTotal,
    exposicaoMaxima, roe, margem, receitaLiquida, totalPos, saldoNaVenda,
    duracaoTotal, tir, vpl, paybackDescontado, moic, breakEvenVGV, fluxosCaixa,
    carregoPos, prestacoesPagas, fluxoDetalhado
  };
}

export function analisarMercado(p: ProjetoInputs, vgvEfetivo: number): AnalyseMercado {
  const comps = p.comparaveis.filter(c => c.area > 0);
  if (comps.length === 0) {
    return { mediaComps: 0, medianaComps: 0, minComp: 0, maxComp: 0, desvioPreco: 0, alertaMercado: 'Sem comparáveis' };
  }
  const precosPorM2 = comps.map(c => c.preco / c.area);
  precosPorM2.sort((a, b) => a - b);
  const media = precosPorM2.reduce((s, v) => s + v, 0) / precosPorM2.length;
  const mediana = precosPorM2.length % 2 === 0
    ? (precosPorM2[precosPorM2.length / 2 - 1] + precosPorM2[precosPorM2.length / 2]) / 2
    : precosPorM2[Math.floor(precosPorM2.length / 2)];
  const modeloPorM2 = p.areaConstruida > 0 ? vgvEfetivo / p.areaConstruida : 0;
  const desvio = mediana > 0 ? (modeloPorM2 - mediana) / mediana : 0;
  const alerta = desvio <= 0.05 ? 'Em linha com mercado'
    : desvio <= 0.15 ? 'Levemente acima do mercado'
    : 'Acima do mercado — revisar preço';
  return {
    mediaComps: media, medianaComps: mediana,
    minComp: precosPorM2[0], maxComp: precosPorM2[precosPorM2.length - 1],
    desvioPreco: desvio, alertaMercado: alerta
  };
}

export function calcularScore(roe: number, margem: number, vpl: number, bufferBreakeven: number): number {
  const scoreROE = Math.min(30, (roe / 1.0) * 30);
  const scoreMargem = Math.min(25, (margem / 0.25) * 25);
  const scoreVPL = vpl > 0 ? Math.min(25, (vpl / 500000) * 25) : 0;
  const scoreBuffer = Math.min(20, (bufferBreakeven / 0.3) * 20);
  return Math.round(Math.max(0, scoreROE + scoreMargem + scoreVPL + scoreBuffer));
}

export function gerarParecer(score: number, margem: number, tir: number, tma: number, roe: number, bufferBreakeven: number): Parecer {
  let recomendacao: string;
  if (score >= 75) recomendacao = 'EXCELENTE — Investimento seguro';
  else if (score >= 55) recomendacao = 'VIÁVEL — Monitorar indicadores';
  else if (score >= 35) recomendacao = 'RISCO ELEVADO — Revisar premissas';
  else recomendacao = 'INVIÁVEL — Não recomendado';

  const alertas: string[] = [];
  const positivos: string[] = [];

  if (margem < 0.15) alertas.push('Margem abaixo de 15% — revisar preço ou custo');
  else positivos.push('Margem líquida saudável');

  if (tir < tma) alertas.push('TIR abaixo da TMA — projeto não remunera o capital');
  else positivos.push('TIR acima da TMA');

  if (bufferBreakeven < 0.10) alertas.push('Buffer break-even crítico — risco de prejuízo');
  else positivos.push('Buffer de break-even confortável');

  if (roe < 0.30) alertas.push('ROE abaixo de 30% — retorno fraco para o risco');
  else positivos.push('ROE atrativo');

  return { recomendacao, alertas, positivos, score };
}

export function gerarAuditChecks(c: CenarioResult, mercado: AnalyseMercado, p: ProjetoInputs, vgvEfetivo: number): AuditCheck[] {
  const bufferBE = vgvEfetivo > 0 ? (vgvEfetivo - c.breakEvenVGV) / vgvEfetivo : 0;
  return [
    { label: 'VGV > Break-even', status: vgvEfetivo > c.breakEvenVGV ? 'ok' : 'fail', detail: `Break-even: R$ ${(c.breakEvenVGV / 1000).toFixed(0)}k` },
    { label: 'TIR > TMA', status: c.tir > p.tma ? 'ok' : 'fail', detail: `TIR: ${(c.tir * 100).toFixed(1)}% vs TMA: ${(p.tma * 100).toFixed(1)}%` },
    { label: 'VPL positivo', status: c.vpl > 0 ? 'ok' : 'fail', detail: `VPL: R$ ${(c.vpl / 1000).toFixed(0)}k` },
    { label: 'ROE > 30%', status: c.roe > 0.3 ? 'ok' : c.roe > 0.15 ? 'warn' : 'fail', detail: `ROE: ${(c.roe * 100).toFixed(1)}%` },
    { label: 'Margem > 15%', status: c.margem > 0.15 ? 'ok' : c.margem > 0.10 ? 'warn' : 'fail', detail: `Margem: ${(c.margem * 100).toFixed(1)}%` },
    { label: 'MOIC > 1,0x', status: c.moic > 1.0 ? 'ok' : 'fail', detail: `MOIC: ${c.moic.toFixed(2)}x` },
    { label: 'Buffer break-even > 10%', status: bufferBE > 0.10 ? 'ok' : bufferBE > 0.05 ? 'warn' : 'fail', detail: `Buffer: ${(bufferBE * 100).toFixed(1)}%` },
    { label: 'Desvio mercado < 20%', status: mercado.desvioPreco < 0.20 ? 'ok' : 'warn', detail: `Desvio: ${(mercado.desvioPreco * 100).toFixed(1)}%` },
    { label: 'Comparáveis preenchidos (mín. 3)', status: p.comparaveis.filter(c => c.area > 0).length >= 3 ? 'ok' : 'warn', detail: `${p.comparaveis.filter(c => c.area > 0).length} comparáveis` },
    { label: 'Exposição < 40% do VGV', status: c.exposicaoMaxima / vgvEfetivo < 0.40 ? 'ok' : 'warn', detail: `${((c.exposicaoMaxima / vgvEfetivo) * 100).toFixed(1)}% do VGV` },
    { label: 'Spread TIR vs TMA positivo', status: c.tir > p.tma ? 'ok' : 'fail', detail: `Spread: ${((c.tir - p.tma) * 100).toFixed(1)}pp` },
    { label: 'Payback dentro do horizonte', status: c.paybackDescontado <= c.duracaoTotal ? 'ok' : 'fail', detail: `${c.paybackDescontado} meses` },
  ];
}

export function calcularProjetoCompleto(p: ProjetoInputs): ProjetoCompleto {
  const custoTotalConstrucao = p.areaConstruida * p.custoPorM2;
  const baseFinanciamento = p.valorLote + custoTotalConstrucao;
  const valorFinanciado = baseFinanciamento * p.percLTV;
  const taxaMensal = Math.pow(1 + p.taxaAnual, 1 / 12) - 1;
  const pmt = valorFinanciado * taxaMensal / (1 - Math.pow(1 + taxaMensal, -p.prazoMeses));

  const totalPreObraSoftCosts = somaPreObra(p);
  const totalDuranteObraHard = somaDuranteObra(p);
  const jurosObra = calcularJurosObra(valorFinanciado, taxaMensal, p.mesesObra);

  const vgvPorM2 = p.precoMercado * p.areaConstruida;
  const vgvEfetivo = Math.max(p.valorVenda, vgvPorM2);

  const carregoPre = (p.condominio + p.iptuAnual / 12) * p.mesesPreObra;
  const carregoDuranteObra = (p.condominio + p.iptuAnual / 12) * p.mesesObra;
  const totalPreObra = totalPreObraSoftCosts + carregoPre;
  const totalDuranteObra = totalDuranteObraHard + carregoDuranteObra + jurosObra;

  const cenA = calcularCenario(p, 'A', p.mesesPosA, custoTotalConstrucao, valorFinanciado, totalPreObraSoftCosts, totalDuranteObraHard, taxaMensal, pmt, jurosObra, vgvEfetivo);
  const cenB = calcularCenario(p, 'B', p.mesesPosB, custoTotalConstrucao, valorFinanciado, totalPreObraSoftCosts, totalDuranteObraHard, taxaMensal, pmt, jurosObra, vgvEfetivo);
  const cenC = calcularCenario(p, 'C', p.mesesPosC, custoTotalConstrucao, valorFinanciado, totalPreObraSoftCosts, totalDuranteObraHard, taxaMensal, pmt, jurosObra, vgvEfetivo);

  const mercado = analisarMercado(p, vgvEfetivo);
  const cronogramaJuros = gerarCronogramaJuros(valorFinanciado, p.taxaAnual, p.mesesObra);

  const bufferBE = vgvEfetivo > 0 ? (vgvEfetivo - cenB.breakEvenVGV) / vgvEfetivo : 0;
  const score = calcularScore(cenB.roe, cenB.margem, cenB.vpl, bufferBE);
  const parecer = gerarParecer(score, cenB.margem, cenB.tir, p.tma, cenB.roe, bufferBE);
  const auditChecks = gerarAuditChecks(cenB, mercado, p, vgvEfetivo);

  return {
    inputs: p, cenarios: { A: cenA, B: cenB, C: cenC },
    mercado, parecer, auditChecks, cronogramaJuros,
    totalPreObra, totalDuranteObra, custoTotalConstrucao, valorFinanciado, jurosObra, pmt
  };
}
