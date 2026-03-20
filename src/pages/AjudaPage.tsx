const indicadores = [
  {
    nome: 'ROE (Return on Equity)',
    formula: 'Lucro Líquido ÷ Exposição Máxima de Caixa',
    interpretacao: 'Mede o retorno sobre o capital próprio investido. Quanto maior, melhor a rentabilidade do equity.',
    bom: 'Acima de 100% — o projeto dobra o capital investido.',
    ruim: 'Abaixo de 30% — retorno insuficiente para o risco imobiliário.',
    exemplo: 'Se você investiu R$ 400k do próprio bolso e lucrou R$ 500k, o ROE é 125%.',
  },
  {
    nome: 'Margem Líquida',
    formula: 'Lucro Líquido ÷ VGV Efetivo',
    interpretacao: 'Mostra quanto do preço de venda sobra como lucro líquido após todos os custos.',
    bom: 'Acima de 25% — margem confortável com espaço para imprevistos.',
    ruim: 'Abaixo de 15% — qualquer desvio pode zerar o lucro.',
    exemplo: 'Para um VGV de R$ 2,8M e lucro de R$ 560k, a margem é 20%.',
  },
  {
    nome: 'TIR (Taxa Interna de Retorno)',
    formula: 'Taxa que zera o VPL do fluxo de caixa do equity',
    interpretacao: 'Indica a taxa de retorno anualizada do investimento. Deve ser comparada com a TMA.',
    bom: 'TIR acima da TMA — o projeto remunera mais que a alternativa de mercado.',
    ruim: 'TIR abaixo da TMA — melhor investir em renda fixa.',
    exemplo: 'Se a TMA é 18% a.a. e a TIR é 45% a.a., há um spread positivo de 27pp.',
  },
  {
    nome: 'VPL (Valor Presente Líquido)',
    formula: 'Σ (Fluxo_i ÷ (1 + TMA_mensal)^i)',
    interpretacao: 'Traz todos os fluxos futuros a valor presente. VPL positivo = o projeto cria valor.',
    bom: 'Quanto maior o VPL, mais valor o projeto gera acima da TMA.',
    ruim: 'VPL negativo significa que o projeto destrói valor — melhor não investir.',
    exemplo: 'VPL de R$ 250k significa que o projeto gera R$ 250k a mais que a TMA aplicada.',
  },
  {
    nome: 'MOIC (Multiple on Invested Capital)',
    formula: '(Exposição + Lucro Líquido) ÷ Exposição',
    interpretacao: 'Mostra quantas vezes o capital investido volta. MOIC 1,5x = recebe 1,5 vezes o que investiu.',
    bom: 'Acima de 1,5x — retorno atrativo.',
    ruim: 'Abaixo de 1,0x — o investidor perde dinheiro.',
    exemplo: 'Investiu R$ 400k e recebeu R$ 600k de volta → MOIC = 1,5x.',
  },
  {
    nome: 'Payback Descontado',
    formula: 'Primeiro mês em que fluxo acumulado descontado ≥ 0',
    interpretacao: 'Indica em quantos meses o investidor recupera o capital, já descontando o custo de oportunidade.',
    bom: 'Payback dentro do horizonte do projeto.',
    ruim: 'Payback maior que a duração total — capital travado por tempo indeterminado.',
    exemplo: 'Se o payback é 17 meses num projeto de 22 meses, o capital fica livre nos últimos 5 meses.',
  },
  {
    nome: 'Break-even VGV',
    formula: 'Menor VGV que zera o lucro líquido (busca binária)',
    interpretacao: 'O preço mínimo pelo qual o imóvel precisa ser vendido para não ter prejuízo.',
    bom: 'Buffer > 20% — margem de segurança boa mesmo com desconto na venda.',
    ruim: 'Buffer < 10% — qualquer negociação de preço pode gerar prejuízo.',
    exemplo: 'Se o break-even é R$ 2,1M e o VGV é R$ 2,8M, o buffer é 25%.',
  },
  {
    nome: 'Exposição Máxima de Caixa',
    formula: 'Total de custos – financiamento + custos pós-obra',
    interpretacao: 'Quanto de capital próprio o investidor precisa ter disponível no pior momento.',
    bom: 'Abaixo de 40% do VGV — risco de capital controlado.',
    ruim: 'Acima de 50% do VGV — comprometimento alto de capital.',
    exemplo: 'Exposição de R$ 700k num VGV de R$ 2,8M = 25% do VGV.',
  },
];

export default function AjudaPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-foreground">Guia de Indicadores</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Entenda cada indicador utilizado na análise de viabilidade. Todos os cálculos são automáticos
        e atualizados em tempo real conforme você altera os dados do projeto.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicadores.map(ind => (
          <div key={ind.nome} className="bg-card border border-border rounded-lg p-5 space-y-3 hover:-translate-y-0.5 transition-transform duration-300">
            <h3 className="font-display text-base text-primary">{ind.nome}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Fórmula</p>
                <p className="font-mono text-xs bg-muted/30 rounded px-2 py-1">{ind.formula}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Como interpretar</p>
                <p className="text-muted-foreground text-xs">{ind.interpretacao}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-success uppercase tracking-wider mb-0.5">✓ Bom</p>
                  <p className="text-xs text-muted-foreground">{ind.bom}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-destructive uppercase tracking-wider mb-0.5">✗ Ruim</p>
                  <p className="text-xs text-muted-foreground">{ind.ruim}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-info uppercase tracking-wider mb-0.5">Exemplo prático</p>
                <p className="text-xs text-muted-foreground">{ind.exemplo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
