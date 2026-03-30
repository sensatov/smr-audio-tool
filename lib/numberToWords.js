const SMALL = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALE = ["", "thousand", "million", "billion", "trillion"];

const ORDINAL_EXCEPTIONS = {
  one: "first",
  two: "second",
  three: "third",
  five: "fifth",
  eight: "eighth",
  nine: "ninth",
  twelve: "twelfth",
};

function chunkToWords(n) {
  let result = [];
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  if (hundreds > 0) result.push(`${SMALL[hundreds]} hundred`);
  if (remainder > 0) {
    if (remainder < 20) {
      result.push(SMALL[remainder]);
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      result.push(one ? `${TENS[ten]}-${SMALL[one]}` : TENS[ten]);
    }
  }

  return result.join(" ");
}

export function integerToWords(input) {
  let n = Number(String(input).replace(/,/g, ""));
  if (Number.isNaN(n)) return String(input);
  if (n === 0) return "zero";
  if (n < 0) return `minus ${integerToWords(Math.abs(n))}`;

  const parts = [];
  let scaleIndex = 0;

  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const chunkWords = chunkToWords(chunk);
      parts.unshift([chunkWords, SCALE[scaleIndex]].filter(Boolean).join(" "));
    }
    n = Math.floor(n / 1000);
    scaleIndex += 1;
  }

  return parts.join(" ");
}

function decimalToWords(value) {
  const [whole, fraction] = value.split(".");
  if (!fraction) return integerToWords(whole);
  return `${integerToWords(whole)} point ${fraction.split("").map((d) => SMALL[Number(d)]).join(" ")}`;
}

function toOrdinalWords(n) {
  const words = integerToWords(n);
  if (ORDINAL_EXCEPTIONS[words]) return ORDINAL_EXCEPTIONS[words];
  if (words.includes("-")) {
    const [prefix, suffix] = words.split("-");
    return `${prefix}-${toOrdinalWords(Number(Object.keys(SMALL).find((key) => SMALL[key] === suffix) ?? n % 10))}`;
  }
  if (words.endsWith("y")) return `${words.slice(0, -1)}ieth`;
  if (words.endsWith("e")) return `${words.slice(0, -1)}th`;
  return `${words}th`;
}

function sanitizeNumberToken(token) {
  return token.replace(/,/g, "");
}

function shouldKeepAsYear(numberToken) {
  if (!/^\d{4}$/.test(numberToken)) return false;
  const value = Number(numberToken);
  return Number.isInteger(value) && value >= 0 && value <= 2100;
}

export function convertNumbersInText(text) {
  const protectedUrls = [];
  let next = text.replace(/https?:\/\/\S+/g, (match) => {
    const key = `__URL_${protectedUrls.length}__`;
    protectedUrls.push(match);
    return key;
  });

  next = next.replace(/\$([0-9][0-9,]*)\.([0-9]{2})\b/g, (_, dollars, cents) => {
    const dollarValue = integerToWords(sanitizeNumberToken(dollars));
    const centValue = integerToWords(Number(cents));
    return `${dollarValue} dollars and ${centValue} cents`;
  });

  next = next.replace(/\$([0-9][0-9,]*)\s+(thousand|million|billion|trillion)\b/gi, (_, amount, scaleWord) => {
    const numberValue = integerToWords(sanitizeNumberToken(amount));
    return `${numberValue} ${scaleWord.toLowerCase()} dollars`;
  });

  next = next.replace(/\$([0-9][0-9,]*)\b/g, (_, dollars) => {
    const dollarValue = integerToWords(sanitizeNumberToken(dollars));
    return `${dollarValue} dollars`;
  });

  next = next.replace(/\b([0-9][0-9,]*(?:\.[0-9]+)?)%/g, (_, numberToken) => {
    return `${decimalToWords(sanitizeNumberToken(numberToken))} percent`;
  });

  next = next.replace(/\b([0-9][0-9,]*)(st|nd|rd|th)\b/gi, (_, numberToken) => {
    return toOrdinalWords(Number(sanitizeNumberToken(numberToken)));
  });

  next = next.replace(/\b([0-9][0-9,]*\.[0-9]+)\b/g, (_, numberToken) => {
    return decimalToWords(sanitizeNumberToken(numberToken));
  });

  next = next.replace(/\b([0-9][0-9,]*)\b/g, (_, numberToken) => {
    const normalizedToken = sanitizeNumberToken(numberToken);
    if (shouldKeepAsYear(normalizedToken)) return numberToken;
    return integerToWords(normalizedToken);
  });

  return next.replace(/__URL_(\d+)__/g, (_, index) => protectedUrls[Number(index)] || "");
}
