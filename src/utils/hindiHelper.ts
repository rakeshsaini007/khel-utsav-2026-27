/**
 * Utility for enforcing Hindi (Devanagari) script on designated inputs.
 */

const COMMON_WORD_MAP: Record<string, string> = {
  shri: 'श्री',
  kumar: 'कुमार',
  kumari: 'कुमारी',
  singh: 'सिंह',
  devi: 'देवी',
  ram: 'राम',
  lal: 'लाल',
  pal: 'पाल',
  prasad: 'प्रसाद',
  sharma: 'शर्मा',
  verma: 'वर्मा',
  khan: 'खां',
  ali: 'अली',
  ahmad: 'अहमद',
  gupta: 'गुप्ता',
  yadav: 'यादव',
  saini: 'सैनी',
  chauhan: 'चौहान',
  gangwar: 'गंगवार',
  mohd: 'मोहम्मद',
  mohammad: 'मोहम्मद',
  til: 'तिल',
  kat: 'कट',
  cut: 'कट',
  nishan: 'निशान',
  mark: 'निशान',
  massa: 'मस्सा',
  mole: 'तिल',
  daaye: 'दाहिने',
  right: 'दाहिने',
  baaye: 'बायें',
  left: 'बायें',
  gaal: 'गाल',
  cheek: 'गाल',
  par: 'पर',
  on: 'पर',
  maathe: 'माथे',
  forehead: 'माथे',
  chot: 'चोट',
  haath: 'हाथ',
  hand: 'हाथ',
  thodi: 'ठोड़ी',
  chin: 'ठोड़ी',
  ka: 'का',
  ke: 'के',
  ki: 'की',
  chhota: 'छोटा',
  bada: 'बड़ा',
  gale: 'गले',
  neck: 'गले'
};

const PHONETIC_CONSONANTS: [string, string][] = [
  ['ksha', 'क्ष'], ['gya', 'ज्ञ'], ['tra', 'त्र'],
  ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['chh', 'छ'],
  ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'],
  ['bh', 'भ'], ['sh', 'श'], ['shh', 'ष'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['t', 'त'],
  ['d', 'द'], ['n', 'न'], ['p', 'प'], ['f', 'फ'],
  ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'],
  ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'],
  ['h', 'ह'], ['q', 'क'], ['x', 'क्स'], ['z', 'ज़']
];

const VOWEL_MATRAS: [string, string][] = [
  ['aa', 'ा'], ['ee', 'ी'], ['oo', 'ू'], ['ai', 'ै'],
  ['au', 'ौ'], ['a', ''], ['i', 'ि'], ['u', 'ु'],
  ['e', 'े'], ['o', 'ो']
];

const INITIAL_VOWELS: [string, string][] = [
  ['aa', 'आ'], ['ee', 'ई'], ['oo', 'ऊ'], ['ai', 'ऐ'],
  ['au', 'औ'], ['a', 'अ'], ['i', 'इ'], ['u', 'उ'],
  ['e', 'ए'], ['o', 'ओ']
];

/**
 * Phonetically transliterates a single English word to Devanagari Hindi
 */
export function transliterateWord(word: string): string {
  if (!word) return '';
  const lower = word.toLowerCase().trim();
  
  // Direct dictionary hit
  if (COMMON_WORD_MAP[lower]) {
    return COMMON_WORD_MAP[lower];
  }

  // If already pure Devanagari, return as is
  if (/^[\u0900-\u097F]+$/.test(word)) {
    return word;
  }

  let res = '';
  let i = 0;
  const len = lower.length;

  while (i < len) {
    const char = lower[i];

    // Check if character is already Devanagari
    if (char >= '\u0900' && char <= '\u097F') {
      res += char;
      i++;
      continue;
    }

    // Check initial vowels if at word start or after space
    if (i === 0 || res === '') {
      let matchedVowel = false;
      for (const [vStr, vHindi] of INITIAL_VOWELS) {
        if (lower.startsWith(vStr, i)) {
          res += vHindi;
          i += vStr.length;
          matchedVowel = true;
          break;
        }
      }
      if (matchedVowel) continue;
    }

    // Try consonants
    let matchedConsonant = false;
    for (const [cStr, cHindi] of PHONETIC_CONSONANTS) {
      if (lower.startsWith(cStr, i)) {
        res += cHindi;
        i += cStr.length;
        matchedConsonant = true;

        // Check following vowel matra
        for (const [vStr, vMatra] of VOWEL_MATRAS) {
          if (lower.startsWith(vStr, i)) {
            res += vMatra;
            i += vStr.length;
            break;
          }
        }
        break;
      }
    }

    if (!matchedConsonant) {
      // Non-alphabetic character or leftover
      if (/[\s\.\,\-\'\"]/.test(char)) {
        res += char;
      }
      i++;
    }
  }

  return res || word;
}

/**
 * Transliterates mixed or phonetic English text to Devanagari Hindi,
 * while preserving already typed Hindi characters.
 */
export function convertToHindi(text: string): string {
  if (!text) return '';
  
  // Split by whitespace while preserving delimiters
  const tokens = text.split(/(\s+|[\.,\-\'\"])/);
  return tokens.map(token => {
    // If token has English letters, transliterate it
    if (/[a-zA-Z]/.test(token)) {
      return transliterateWord(token);
    }
    return token;
  }).join('');
}

/**
 * Strips any remaining non-Devanagari characters, allowing only:
 * - Devanagari letters (\u0900-\u097F)
 * - Spaces
 * - Standard punctuation (. , - / ')
 */
export function filterStrictHindiOnly(text: string): string {
  if (!text) return '';
  return text.replace(/[^\u0900-\u097F\s\.\,\-\'\/\u200C\u200D]/g, '');
}

/**
 * Checks if a string contains any Latin characters (not Hindi)
 */
export function hasNonHindiCharacters(text: string): boolean {
  if (!text) return false;
  return /[a-zA-Z0-9]/.test(text);
}
