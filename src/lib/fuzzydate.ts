// Dates that may be partial: "2021" (only the year), "2021-03" (month and year) or
// "2021-03-05" (full date). Used by the gallery for pictures and albums, because the
// exact day of an old drawing or photo is often unknown.
//
// Also guesses a picture's date from its original file name, the way phones and apps
// name files: 20210303_200924.jpg, IMG-20210211-WA0008.jpeg, Screenshot_20260512_...,
// FB_IMG_1681694643017.jpg (milliseconds since 1970).

export interface FuzzyDate {
  text: string;            // "2021", "2021-03" or "2021-03-05": also valid for <time datetime>
  year: number;
  month?: number;          // 1-12
  day?: number;
  sortValue: number;       // for ordering; a partial date sorts at the start of its period
  label: string;           // "2021", "mar. 2021"
  longLabel: string;       // "2021", "março de 2021"
}

export const FUZZY_DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

const MONTHS_SHORT = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
const MONTHS_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// accepts the string forms above, a bare year as a number (YAML reads `date: 2021` as 2021)
// and a Date (YAML/Markdown headers turn 2021-03-05 into one)
export function parseFuzzyDate(value: unknown): FuzzyDate | undefined {
  if (value == null || value === "") return undefined;
  let text: string;
  if (value instanceof Date) text = value.toISOString().slice(0, 10);
  else text = String(value).trim();
  if (!FUZZY_DATE.test(text)) return undefined;
  const [year, month, day] = text.split("-").map(Number);
  const m = month ? month - 1 : 0;
  return {
    text, year, month, day,
    sortValue: Date.UTC(year, m, day ?? 1),
    label: month ? `${MONTHS_SHORT[m]} ${year}` : String(year),
    longLabel: month ? `${MONTHS_LONG[m]} de ${year}` : String(year),
  };
}

// a plausible date hidden in a file name, or undefined
export function dateFromFileName(name: string | undefined): FuzzyDate | undefined {
  if (!name) return undefined;
  const base = name.split("/").pop()!;
  const now = new Date().getUTCFullYear();
  // 20210303, 2021-03-03, 2021_03_03 (not glued to other digits)
  for (const m of base.matchAll(/(?<!\d)((?:19|20)\d{2})[-_.]?(\d{2})[-_.]?(\d{2})(?!\d)/g)) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (y >= 1990 && y <= now && mo >= 1 && mo <= 12 && d >= 1 && d <= 31)
      return parseFuzzyDate(`${m[1]}-${m[2]}-${m[3]}`);
  }
  // 13-digit timestamps in milliseconds (FB_IMG_..., some messaging apps)
  const ms = base.match(/(?<!\d)(1[2-9]\d{11})(?!\d)/);
  if (ms) {
    const d = new Date(Number(ms[1]));
    if (d.getUTCFullYear() >= 2008 && d.getUTCFullYear() <= now) return parseFuzzyDate(d.toISOString().slice(0, 10));
  }
  return undefined;
}
