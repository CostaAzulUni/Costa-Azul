import type { SelectOption } from "../../../../components";


// encontra texto de exibição (label) correspondente a um valor específico em uma lista de opções do Select. Se o valor não for encontrado, retorna o próprio valor como fallback.
export function getOptionLabel(options: SelectOption[], value: string): string {
  if (!value) return "—";
  return options.find((opt) => String(opt.value) === value)?.label ?? value;
}


// formata valores numéricos para exibição, aplicando separadores de milhar e casas decimais conforme a localidade brasileira, e adicionando uma unidade opcional ao final.
export function formatMetric(
  value: number | null,
  unit?: string,
  decimals = 0
): string {
  if (value === null || Number.isNaN(value)) return "—";
  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return unit ? `${formatted} ${unit}` : formatted;
}

// formata uma data no formato ISO (YYYY-MM-DD) para o formato brasileiro (DD/MM/YYYY). Se a data não estiver no formato esperado, retorna a própria string de entrada.

export function formatIsoDateBr(isoDate: string): string {
  if (!isoDate) return "—";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
