const normalizeText = (text) => {
    return String(text || "")
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[!?.,;:'"`()[\]{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const ENGLISH_WORDS = new Set([
    "the",
    "is",
    "are",
    "a",
    "an",
    "i",
    "my",
    "me",
    "to",
    "in",
    "on",
    "of",
    "for",
    "can",
    "do",
    "does",
    "how",
    "what",
    "why",
    "where",
    "when",
    "which",
    "with",
    "from",
    "this",
    "that",
    "have",
    "has",
    "get",
    "need",
    "want",
    "please"
]);

const HINDI_ROMAN_WORDS = new Set([
    "mera",
    "meri",
    "mere",
    "mujhe",
    "mujhko",
    "mujhse",
    "kya",
    "kyu",
    "kyon",
    "kyunki",
    "kaise",
    "kab",
    "kaha",
    "kahaan",
    "hai",
    "hain",
    "nahi",
    "karna",
    "karni",
    "karne",
    "hua",
    "huyi",
    "ho",
    "gaya",
    "gayi",
    "milega",
    "milega",
    "chahiye",
    "raha",
    "rahi",
    "rahe",
    "sakta",
    "sakti",
    "sakte",
    "karo",
    "karun",
    "kyon"
]);

const ODIA_ROMAN_WORDS = new Set([
    "mu",
    "mora",
    "mor",
    "mate",
    "mo",
    "mote",
    "tama",
    "tume",
    "apananka",
    "kana",
    "kain",
    "kahinki",
    "kemiti",
    "kebe",
    "kouthi",
    "kie",
    "achhi",
    "achi",
    "nahi",
    "heuni",
    "hela",
    "heigala",
    "hauchhi",
    "karibi",
    "kariba",
    "karibaku",
    "karuchi",
    "karuchhi",
    "darkar",
    "miliba",
    "pariba",
    "paruni",
    "kete",
    "kie",
    "ku",
    "ra",
    "re",
    "pain",
    "au",
    "sabu"
]);

const countWords = (
    text,
    dictionary
) => {
    return normalizeText(text)
        .split(" ")
        .filter(Boolean)
        .filter((word) =>
            dictionary.has(word)
        ).length;
};

export const detectSupportLanguage = (
    text
) => {
    const normalized =
        normalizeText(text);

    if (!normalized) {
        return "en";
    }

    if (
        /[\u0B00-\u0B7F]/.test(
            normalized
        )
    ) {
        return "or";
    }

    if (
        /[\u0900-\u097F]/.test(
            normalized
        )
    ) {
        return "hi";
    }

    const englishScore =
        countWords(
            normalized,
            ENGLISH_WORDS
        );

    const hindiScore =
        countWords(
            normalized,
            HINDI_ROMAN_WORDS
        );

    const odiaScore =
        countWords(
            normalized,
            ODIA_ROMAN_WORDS
        );

    const scores = {
        en: englishScore,
        hi: hindiScore,
        or: odiaScore
    };

    const sorted =
        Object.entries(scores)
            .sort(
                ([, a], [, b]) =>
                    b - a
            );

    const [topLanguage, topScore] =
        sorted[0];

    const [, secondScore] =
        sorted[1];

    if (topScore === 0) {
        return "en";
    }

    /*
     * Roman Hindi/Odia should remain in
     * their own language even when the
     * question contains a few generic
     * English words such as:
     * task, locked, deadline, help, please.
     *
     * A concrete Hindi/Odia signal wins
     * unless the competing language has
     * equally strong language evidence.
     */
    if (
        topLanguage === "hi" ||
        topLanguage === "or"
    ) {
        if (
            topScore >= 2 &&
            topScore > secondScore
        ) {
            return topLanguage;
        }
    }

    /*
     * Genuine mixed-language questions
     * require comparable language signals.
     */
    if (
        secondScore > 0 &&
        topScore - secondScore <= 1
    ) {
        return "mixed";
    }

    return topLanguage;
};

export const normalizeSupportQuestion =
    normalizeText;
