export type UzbekScript = 'latin' | 'cyrillic' | 'updated-latin';

const STORAGE_KEY = 'solaris3d-uzbek-script';
const VALID_SCRIPTS: UzbekScript[] = ['latin', 'cyrillic', 'updated-latin'];

type TextRecord = { source: string; rendered: string };
type AttributeRecord = { source: string; rendered: string };

const textRecords = new WeakMap<Text, TextRecord>();
const textNodes = new Set<Text>();
const attributeRecords = new WeakMap<Element, Map<string, AttributeRecord>>();
const attributeElements = new Set<Element>();
let activeScript: UzbekScript = 'latin';
let observer: MutationObserver | undefined;
let observedRoot: HTMLElement | null = null;

function isUzbekScript(value: string | null): value is UzbekScript {
  return value !== null && VALID_SCRIPTS.includes(value as UzbekScript);
}

export function getUzbekScript(): UzbekScript {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isUzbekScript(stored)) return stored;
  } catch {
    // Storage can be disabled; keep the default script for this session.
  }
  return 'latin';
}

function preserveCase(source: string, replacement: string): string {
  if (source.toUpperCase() === source) return replacement.toUpperCase();
  if (source[0]?.toUpperCase() === source[0]) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: 'A', а: 'a', Б: 'B', б: 'b', В: 'V', в: 'v', Г: 'G', г: 'g', Д: 'D', д: 'd',
  Е: 'E', е: 'e', Ё: 'Yo', ё: 'yo', Ж: 'J', ж: 'j', З: 'Z', з: 'z', И: 'I', и: 'i',
  Й: 'Y', й: 'y', К: 'K', к: 'k', Л: 'L', л: 'l', М: 'M', м: 'm', Н: 'N', н: 'n',
  О: 'O', о: 'o', П: 'P', п: 'p', Р: 'R', р: 'r', С: 'S', с: 's', Т: 'T', т: 't',
  У: 'U', у: 'u', Ф: 'F', ф: 'f', Х: 'X', х: 'x', Ц: 'Ts', ц: 'ts', Ч: 'Ch', ч: 'ch',
  Ш: 'Sh', ш: 'sh', Щ: 'Shch', щ: 'shch', Ъ: 'ʼ', ъ: 'ʼ', Ы: 'I', ы: 'i', Ь: '', ь: '',
  Э: 'E', э: 'e', Ю: 'Yu', ю: 'yu', Я: 'Ya', я: 'ya', Қ: 'Q', қ: 'q', Ғ: 'Gʻ', ғ: 'gʻ',
  Ў: 'Oʻ', ў: 'oʻ', Ҳ: 'H', ҳ: 'h',
};

const LATIN_TO_CYRILLIC: [RegExp, string][] = [
  [/shch/gi, 'щ'],
  [/sh/gi, 'ш'],
  [/ch/gi, 'ч'],
  [/ng/gi, 'нг'],
  [/(g|ğ|gʻ|gʼ|g'|g‘|g`)/gi, 'ғ'],
  [/(o|ŏ|oʻ|oʼ|o'|o‘|o`)/gi, 'ў'],
  [/yo/gi, 'ё'],
  [/yu/gi, 'ю'],
  [/ya/gi, 'я'],
  [/ts/gi, 'ц'],
  [/q/gi, 'қ'],
  [/x/gi, 'х'],
  [/h/gi, 'ҳ'],
  [/j/gi, 'ж'],
  [/a/gi, 'а'], [/b/gi, 'б'], [/d/gi, 'д'], [/e/gi, 'е'], [/f/gi, 'ф'],
  [/g/gi, 'г'], [/i/gi, 'и'], [/k/gi, 'к'], [/l/gi, 'л'], [/m/gi, 'м'],
  [/n/gi, 'н'], [/p/gi, 'п'], [/r/gi, 'р'], [/s/gi, 'с'], [/t/gi, 'т'],
  [/u/gi, 'у'], [/v/gi, 'в'], [/y/gi, 'й'], [/z/gi, 'з'],
];

function toLatin(value: string, updated: boolean): string {
  const latin = Array.from(value, (character) => CYRILLIC_TO_LATIN[character] ?? character).join('');
  return updated ? latin.replace(/gʻ/gi, (match) => preserveCase(match, 'ğ')).replace(/oʻ/gi, (match) => preserveCase(match, 'ŏ')) : latin;
}

function toCyrillic(value: string): string {
  return LATIN_TO_CYRILLIC.reduce((result, [pattern, replacement]) =>
    result.replace(pattern, (match) => preserveCase(match, replacement)), value);
}

export function transliterateUzbek(value: string, script: UzbekScript): string {
  if (script === 'cyrillic') return toCyrillic(value);
  const latin = toLatin(value, script === 'updated-latin');
  if (script === 'updated-latin') return latin;
  // Convert the modified letters of the proposed alphabet back to the currently used apostrophe form.
  return latin.replace(/ğ/gi, (match) => preserveCase(match, 'gʻ')).replace(/ŏ/gi, (match) => preserveCase(match, 'oʻ'));
}

function isExcluded(node: Node): boolean {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest('[data-uzbek-script-control],script,style,textarea,input,code,pre'));
}

function applyText(node: Text) {
  if (isExcluded(node)) return;
  const previous = textRecords.get(node);
  const source = previous && node.data === previous.rendered ? previous.source : node.data;
  const rendered = transliterateUzbek(source, activeScript);
  textRecords.set(node, { source, rendered });
  textNodes.add(node);
  if (node.data !== rendered) node.data = rendered;
}

const TRANSLATABLE_ATTRIBUTES = ['title', 'aria-label', 'placeholder'] as const;

function applyAttributes(element: Element) {
  if (element.closest('[data-uzbek-script-control],script,style,textarea,input,code,pre')) return;
  let records = attributeRecords.get(element);
  if (!records) {
    records = new Map();
    attributeRecords.set(element, records);
  }
  for (const name of TRANSLATABLE_ATTRIBUTES) {
    const current = element.getAttribute(name);
    if (current === null) continue;
    const previous = records.get(name);
    const source = previous && current === previous.rendered ? previous.source : current;
    const rendered = transliterateUzbek(source, activeScript);
    records.set(name, { source, rendered });
    if (current !== rendered) element.setAttribute(name, rendered);
  }
  attributeElements.add(element);
}

function applyTree(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    applyText(node as Text);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
  if (node instanceof Element) applyAttributes(node);
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let text: Node | null;
  while ((text = walker.nextNode())) applyText(text as Text);
  if (node instanceof Element) {
    node.querySelectorAll('*').forEach(applyAttributes);
  }
}

export function setUzbekScript(script: UzbekScript) {
  activeScript = script;
  try {
    window.localStorage.setItem(STORAGE_KEY, script);
  } catch {
    // The selection still applies until the page is reloaded.
  }
  document.documentElement.lang = script === 'cyrillic' ? 'uz-Cyrl-UZ' : 'uz-Latn-UZ';

  for (const node of textNodes) {
    if (!node.isConnected) {
      textNodes.delete(node);
      continue;
    }
    applyText(node);
  }
  for (const element of attributeElements) {
    if (!element.isConnected) {
      attributeElements.delete(element);
      continue;
    }
    applyAttributes(element);
  }
}

export function observeUzbekScript(root: HTMLElement) {
  observedRoot = root;
  activeScript = getUzbekScript();
  setUzbekScript(activeScript);
  observer?.disconnect();
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        applyText(mutation.target as Text);
      } else if (mutation.type === 'attributes' && mutation.target instanceof Element) {
        applyAttributes(mutation.target);
      } else {
        mutation.addedNodes.forEach(applyTree);
      }
    }
  });
  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
  });
  applyTree(root);
}

export function getObservedUzbekScriptRoot() {
  return observedRoot;
}
