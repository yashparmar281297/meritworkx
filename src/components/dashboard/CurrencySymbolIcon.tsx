import { getCurrencyForCountry } from "@/lib/currency";

export default function CurrencySymbolIcon({
  viewerCountry,
  size = 20,
  color,
}: {
  viewerCountry?: string | null;
  size?: number;
  color: string;
}) {
  const { symbol } = getCurrencyForCountry(viewerCountry);
  const isMultiChar = symbol.length > 1;

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: isMultiChar ? size * 0.75 : size,
        fontWeight: 400,
        color,
        lineHeight: 1,
        WebkitTextStroke: `0.4px ${color}`,
      }}
    >
      {symbol}
    </span>
  );
}