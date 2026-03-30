import { convertNumbersInText, integerToWords } from "./numberToWords";

const REMOVE_SELECTORS = [
  "figure.article-inline",
  "figure",
  "figcaption",
  ".callout-pullquote",
  ".callout-highlight",
  ".callout-exhibit",
  ".news-signup",
  "[class*='hbspt-form']",
  "[class*='news-signup']",
  ".related-queryly__container",
  ".article-summary",
  ".article-left-col",
  ".article-options",
  ".article-ad",
  ".article-doi",
  ".article-ref",
  ".article-ack",
  ".article-reprint",
  ".article-tags",
  ".article-right-col",
  ".article-sidebar",
  ".callout-info",
  ".callout-featured-sidebar",
  ".article-paywall",
  ".paywall-blinder",
  ".callout-audio-post",
  ".article-narration",
  ".floating-nav",
  ".article-interactive-content",
  ".article-left-col--footer",
  "script",
  "style",
  "noscript",
  "sup",
];

const BODY_TAGS = new Set(["P", "H2", "H3", "H4", "H5", "H6", "OL", "UL", "BLOCKQUOTE"]);

function textContent(node) {
  return (node?.textContent || "").replace(/\s+/g, " ").trim();
}

function cleanupText(text) {
  let next = text.replace(/\[\d+\]/g, "");
  next = convertNumbersInText(next);
  next = next.replace(/\n{3,}/g, "\n\n");
  return next.trim();
}

function listToText(listElement, ordered) {
  const items = [...listElement.querySelectorAll(":scope > li")];
  return items
    .map((item, index) => {
      const value = textContent(item);
      if (!value) return "";
      if (ordered) return `Number ${integerToWords(index + 1)}. ${value}`;
      return `List item. ${value}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function parseArticleHtml(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  const title = textContent(doc.querySelector("h1.article-header__title"));
  const author = textContent(doc.querySelector("a.article-header__byline"));
  const deck = textContent(doc.querySelector("h2.article-header__deck"));
  const articleContent = doc.querySelector("div.standard-content.article-content");

  if (!articleContent) {
    throw new Error(
      "Could not find the article content. Make sure you uploaded the full HTML source of an MIT SMR article."
    );
  }

  const bodyRoot = articleContent.cloneNode(true);
  REMOVE_SELECTORS.forEach((selector) => {
    bodyRoot.querySelectorAll(selector).forEach((node) => node.remove());
  });

  const blocks = [...bodyRoot.children]
    .filter((child) => BODY_TAGS.has(child.tagName))
    .map((child) => {
      if (child.tagName === "OL") return listToText(child, true);
      if (child.tagName === "UL") return listToText(child, false);
      if (child.tagName === "BLOCKQUOTE") {
        const quote = textContent(child);
        return quote ? `Quote: ${quote}\nEnd quote.` : "";
      }
      if (["H2", "H3", "H4", "H5", "H6"].includes(child.tagName)) {
        const heading = textContent(child);
        return heading ? `\n${heading}\n` : "";
      }
      return textContent(child);
    })
    .filter(Boolean)
    .join("\n\n");

  const bios = [...doc.querySelectorAll("div.article-authors .article-authors__bio")]
    .map((bio) => textContent(bio))
    .filter(Boolean);

  const scriptParts = [];
  if (title) scriptParts.push(title);
  if (author) scriptParts.push(`by ${author}`);
  if (deck) scriptParts.push(deck);
  scriptParts.push(blocks);
  if (bios.length > 0) scriptParts.push(`About the Author.\n\n${bios.join("\n\n")}`);

  return cleanupText(scriptParts.join("\n\n"));
}
