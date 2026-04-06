export function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    "USD ($)": "$",
    "EUR (€)": "€",
    "GBP (£)": "£",
    "INR (₹)": "₹",
    "JPY (¥)": "¥",
    "AED (د.إ)": "د.إ",
    "SGD (S$)": "S$",
    "AUD (A$)": "A$",
    "CAD (C$)": "C$",
    "BRL (R$)": "R$",
  };
  return map[currency] || "₹";
}

/** Map from our currency label strings to ISO 4217 codes for Intl.NumberFormat */
const CURRENCY_ISO: Record<string, string> = {
  "USD ($)": "USD",
  "EUR (€)": "EUR",
  "GBP (£)": "GBP",
  "INR (₹)": "INR",
  "JPY (¥)": "JPY",
  "AED (د.إ)": "AED",
  "SGD (S$)": "SGD",
  "AUD (A$)": "AUD",
  "CAD (C$)": "CAD",
  "BRL (R$)": "BRL",
};

const USD_RATES: Record<string, number> = {
  "USD ($)": 1,
  "EUR (€)": 0.92,
  "GBP (£)": 0.79,
  "INR (₹)": 83,
  "JPY (¥)": 150,
  "AED (د.إ)": 3.67,
  "SGD (S$)": 1.35,
  "AUD (A$)": 1.53,
  "CAD (C$)": 1.36,
  "BRL (R$)": 5.0,
};

// Session-level cache for live rates
let liveRates: Record<string, number> | null = null;

/**
 * Fetches live exchange rates from open.er-api.com.
 * Results are cached in sessionStorage for the browser session.
 * Falls back to static USD_RATES silently on any error.
 */
export async function loadLiveRates(): Promise<void> {
  // Check sessionStorage first (cache for this browser session)
  const cached = sessionStorage.getItem("cmp_exchange_rates");
  if (cached) {
    try {
      liveRates = JSON.parse(cached);
      return;
    } catch {
      /* ignore parse errors */
    }
  }
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (response.ok) {
      const data = await response.json();
      if (data.rates) {
        const rates: Record<string, number> = {
          "USD ($)": 1,
          "EUR (€)": data.rates.EUR ?? 0.92,
          "GBP (£)": data.rates.GBP ?? 0.79,
          "INR (₹)": data.rates.INR ?? 83,
          "JPY (¥)": data.rates.JPY ?? 150,
          "AED (د.إ)": data.rates.AED ?? 3.67,
          "SGD (S$)": data.rates.SGD ?? 1.35,
          "AUD (A$)": data.rates.AUD ?? 1.53,
          "CAD (C$)": data.rates.CAD ?? 1.36,
          "BRL (R$)": data.rates.BRL ?? 5.0,
        };
        liveRates = rates;
        sessionStorage.setItem("cmp_exchange_rates", JSON.stringify(rates));
      }
    }
  } catch {
    // Silently fall back to static rates — no error surfaced to user
  }
}

export function convertFromUSD(usdPrice: number, currency: string): number {
  const rates = liveRates ?? USD_RATES;
  const rate = rates[currency] ?? 83;
  return Math.round(usdPrice * rate * 100) / 100;
}

/**
 * Format a monetary value using the user's selected currency string.
 * The value is treated as already being in the target currency (not USD).
 * Use convertFromUSD() first if the source is USD.
 *
 * @param amount - Numeric amount in the target currency
 * @param currencyLabel - Currency label from the CURRENCIES list (e.g. "INR (₹)")
 */
export function formatCurrencyValue(
  amount: number,
  currencyLabel: string,
): string {
  const iso = CURRENCY_ISO[currencyLabel] ?? "INR";
  const locale = iso === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: iso,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CURRENCIES = [
  "USD ($)",
  "EUR (€)",
  "GBP (£)",
  "INR (₹)",
  "JPY (¥)",
  "AED (د.إ)",
  "SGD (S$)",
  "AUD (A$)",
  "CAD (C$)",
  "BRL (R$)",
];

export const NATIONALITIES = [
  { label: "🇮🇳 India", code: "+91" },
  { label: "🇺🇸 United States", code: "+1" },
  { label: "🇬🇧 United Kingdom", code: "+44" },
  { label: "🇦🇪 UAE", code: "+971" },
  { label: "🇸🇬 Singapore", code: "+65" },
  { label: "🇦🇺 Australia", code: "+61" },
  { label: "🇨🇦 Canada", code: "+1" },
  { label: "🇩🇪 Germany", code: "+49" },
  { label: "🇫🇷 France", code: "+33" },
  { label: "🇯🇵 Japan", code: "+81" },
  { label: "🇨🇳 China", code: "+86" },
  { label: "🇧🇷 Brazil", code: "+55" },
  { label: "🇿🇦 South Africa", code: "+27" },
  { label: "🇳🇬 Nigeria", code: "+234" },
  { label: "🇲🇾 Malaysia", code: "+60" },
  { label: "🇵🇭 Philippines", code: "+63" },
  { label: "🇮🇩 Indonesia", code: "+62" },
  { label: "🇰🇷 South Korea", code: "+82" },
  { label: "🇸🇦 Saudi Arabia", code: "+966" },
  { label: "🇶🇦 Qatar", code: "+974" },
  { label: "🇧🇩 Bangladesh", code: "+880" },
  { label: "🇵🇰 Pakistan", code: "+92" },
];
