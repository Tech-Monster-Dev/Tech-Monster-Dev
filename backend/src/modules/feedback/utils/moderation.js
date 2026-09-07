import { ALL_MODERATION_WORDS } from "./moderation.words.js";

const LEET_MAP = {
    "@": "a",
    "3": "e",
    "1": "i",
    "!": "i",
    "0": "o",
    "$": "s",
    "5": "s",
    "7": "t"
};

const normalizeText = (value = "") =>
    value
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[^\p{L}\p{N}\s@31!0$57]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

const normalizeForCompactMatch = (value = "") =>
    normalizeText(value)
        .split("")
        .map((character) => LEET_MAP[character] ?? character)
        .join("")
        .replace(/\s+/g, "");

const containsModerationWord = (value = "") => {
    const normalized = normalizeText(value);
    const compact = normalizeForCompactMatch(value);
    const tokens = normalized.split(/\s+/).filter(Boolean);

    return ALL_MODERATION_WORDS.some((word) => {
        const normalizedWord = normalizeText(word);
        if (!normalizedWord) return false;

        if (normalizedWord.length < 4) {
            return tokens.includes(normalizedWord);
        }

        const compactWord = normalizeForCompactMatch(word);

        return (
            tokens.includes(normalizedWord) ||
            compact.includes(compactWord)
        );
    });
};

export const moderateFeedbackText = ({ subject = "", message = "" } = {}) => {
    const flaggedSubject = containsModerationWord(subject);
    const flaggedMessage = containsModerationWord(message);

    if (flaggedSubject || flaggedMessage) {
        return {
            isAllowed: false,
            reason: flaggedSubject && flaggedMessage
                ? "Inappropriate wording detected in subject and feedback"
                : flaggedSubject
                    ? "Inappropriate wording detected in subject"
                    : "Inappropriate wording detected in feedback"
        };
    }

    return {
        isAllowed: true,
        reason: ""
    };
};
