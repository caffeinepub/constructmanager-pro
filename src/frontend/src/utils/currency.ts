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

export function convertFromUSD(usdPrice: number, currency: string): number {
  const rate = USD_RATES[currency] ?? 83;
  return Math.round(usdPrice * rate * 100) / 100;
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
