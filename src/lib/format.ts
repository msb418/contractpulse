export const fmtCurrency = (n?: number, currency = "USD") =>
  typeof n === "number"
    ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n)
    : "—";

export const fmtDate = (iso?: string | Date) => {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};