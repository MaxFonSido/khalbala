// Map common World Cup team names to ISO 3166-1 alpha-2 codes for flagcdn.com
const TEAM_TO_ISO: Record<string, string> = {
  "Argentina": "ar", "Brazil": "br", "France": "fr", "England": "gb-eng",
  "Germany": "de", "Spain": "es", "Portugal": "pt", "Netherlands": "nl",
  "Italy": "it", "Belgium": "be", "Uruguay": "uy", "Croatia": "hr",
  "Morocco": "ma", "Japan": "jp", "South Korea": "kr", "Australia": "au",
  "United States": "us", "Mexico": "mx", "Canada": "ca", "Ecuador": "ec",
  "Senegal": "sn", "Ghana": "gh", "Cameroon": "cm", "Nigeria": "ng",
  "South Africa": "za", "Egypt": "eg", "Algeria": "dz", "Tunisia": "tn",
  "Saudi Arabia": "sa", "Iran": "ir", "Qatar": "qa", "Japan": "jp",
  "Serbia": "rs", "Poland": "pl", "Switzerland": "ch", "Denmark": "dk",
  "Sweden": "se", "Norway": "no", "Turkey": "tr", "Ukraine": "ua",
  "Colombia": "co", "Chile": "cl", "Peru": "pe", "Venezuela": "ve",
  "Paraguay": "py", "Bolivia": "bo", "Panama": "pa", "Costa Rica": "cr",
  "Honduras": "hn", "El Salvador": "sv", "Guatemala": "gt", "Jamaica": "jm",
  "Trinidad and Tobago": "tt", "Haiti": "ht", "Cuba": "cu",
  "New Zealand": "nz", "Indonesia": "id", "Thailand": "th", "Vietnam": "vn",
  "China": "cn", "India": "in", "Iraq": "iq", "Syria": "sy",
  "Uzbekistan": "uz", "Kazakhstan": "kz", "Bahrain": "bh", "Kuwait": "kw",
  "Oman": "om", "Jordan": "jo", "Palestine": "ps", "Lebanon": "lb",
  "Wales": "gb-wls", "Scotland": "gb-sct", "Northern Ireland": "gb-nir",
  "Slovakia": "sk", "Czech Republic": "cz", "Hungary": "hu", "Romania": "ro",
  "Bulgaria": "bg", "Greece": "gr", "Albania": "al", "Kosovo": "xk",
  "North Macedonia": "mk", "Bosnia and Herzegovina": "ba", "Slovenia": "si",
  "Austria": "at", "Finland": "fi", "Ireland": "ie", "Iceland": "is",
  "Luxembourg": "lu", "Malta": "mt", "Cyprus": "cy",
  "Ivory Coast": "ci", "Mali": "ml", "Burkina Faso": "bf", "Guinea": "gn",
  "Cape Verde": "cv", "Benin": "bj", "Zambia": "zm", "Zimbabwe": "zw",
  "Uganda": "ug", "Tanzania": "tz", "Kenya": "ke", "Ethiopia": "et",
  "Angola": "ao", "Mozambique": "mz", "Madagascar": "mg",
  "Congo DR": "cd", "Congo": "cg", "Gabon": "ga",
  "Côte d'Ivoire": "ci",
};

export function flagUrl(teamName: string | null): string | null {
  if (!teamName) return null;
  const iso = TEAM_TO_ISO[teamName];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}
