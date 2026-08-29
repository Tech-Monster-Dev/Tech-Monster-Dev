import {
    loadSupportKnowledgeSources
} from "./supportKnowledgeLoader.js";

import {
    normalizeSupportQuestion,
    detectSupportLanguage
} from "./supportLanguage.js";

const STOP_WORDS = new Set([
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
    "how",
    "what",
    "why",
    "where",
    "when",

    "mu",
    "mora",
    "mote",
    "mo",
    "re",
    "ra",
    "ku",
    "kemiti",
    "kana",
    "kouthi",
    "kie",

    "kaise",
    "kya",
    "mera",
    "mujhe",
    "main",
    "mein",
    "hai",
    "hain",
    "ko",
    "se",
    "ka",
    "ki",
    "ke"
]);

const tokenize = (text) => {
    return normalizeSupportQuestion(text)
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(
            (word) =>
                word.length >= 2 &&
                !STOP_WORDS.has(word)
        );
};

const LANGUAGE_WORDS = {
    en: new Set([
        "the",
        "is",
        "are",
        "what",
        "why",
        "when",
        "where",
        "how",
        "can",
        "does",
        "do",
        "my",
        "your",
        "please",
        "help",
        "with",
        "from",
        "this",
        "that"
    ]),

    or: new Set([
        "mu",
        "mora",
        "mor",
        "mate",
        "mote",
        "mo",
        "tama",
        "tume",
        "kana",
        "kain",
        "kahinki",
        "kemiti",
        "kebe",
        "kouthi",
        "achhi",
        "achi",
        "nahi",
        "heuni",
        "hela",
        "hauchhi",
        "karibi",
        "kariba",
        "karuchi",
        "karuchhi",
        "darkar",
        "miliba",
        "pariba",
        "paruni",
        "kete",
        "ra",
        "re",
        "ku",
        "pain",
        "au",
        "sabu"
    ]),

    hi: new Set([
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
        "chahiye",
        "raha",
        "rahi",
        "rahe",
        "sakta",
        "sakti",
        "sakte",
        "karo",
        "karun",
        "ki",
        "ka",
        "ke",
        "ko",
        "se"
    ])
};

const similarityScore = (
    questionTokens,
    candidateTokens,
    candidateLanguage
) => {
    if (
        !questionTokens.length ||
        !candidateTokens.length
    ) {
        return 0;
    }

    const candidateSet =
        new Set(candidateTokens);

    let matched = 0;

    for (const token of questionTokens) {
        if (candidateSet.has(token)) {
            matched++;
            continue;
        }

        const partialMatch =
            candidateTokens.some(
                (candidate) =>
                    candidate.length >= 4 &&
                    token.length >= 4 &&
                    (
                        candidate.includes(token) ||
                        token.includes(candidate)
                    )
            );

        if (partialMatch) {
            matched += 0.5;
        }
    }

    const coverage =
        matched /
        Math.max(
            questionTokens.length,
            candidateTokens.length
        );

    const questionCoverage =
        matched /
        questionTokens.length;

    let score =
        coverage * 0.4 +
        questionCoverage * 0.6;

    /*
     * Language-specific words are much
     * stronger evidence than generic words
     * such as task, locked, help, etc.
     */
    if (
        candidateLanguage &&
        candidateLanguage !== "mixed" &&
        LANGUAGE_WORDS[candidateLanguage]
    ) {
        const languageWords =
            LANGUAGE_WORDS[candidateLanguage];

        const questionLanguageMatches =
            questionTokens.filter(
                (token) =>
                    languageWords.has(token)
            ).length;

        const candidateLanguageMatches =
            candidateTokens.filter(
                (token) =>
                    languageWords.has(token)
            ).length;

        if (
            questionLanguageMatches > 0
        ) {
            const languageCoverage =
                questionLanguageMatches /
                Math.max(
                    1,
                    candidateLanguageMatches
                );

            score += Math.min(
                0.25,
                languageCoverage * 0.25
            );
        }
    }

    return Math.min(
        1,
        score
    );
};

const flattenSupportEntries = (
    sources
) => {
    return sources.flatMap(
        (source) => {
            const entries =
                Array.isArray(
                    source.data?.entries
                )
                    ? source.data.entries
                    : [];

            return entries.map(
                (entry) => ({
                    ...entry,
                    category:
                        entry.category ||
                        source.data?.category ||
                        source.type,
                    sourceFile:
                        source.file,
                    sourceType:
                        source.type
                })
            );
        }
    );
};

const getQuestionVariants = (
    entry
) => {
    const questions =
        entry?.questions || {};

    return Object.entries(
        questions
    ).flatMap(
        ([language, values]) =>
            Array.isArray(values)
                ? values.map(
                    (question) => ({
                        language,
                        question
                    })
                )
                : []
    );
};

const getAnswer = (
    entry,
    language,
    matchedLanguage
) => {
    const answers =
        entry?.answers || {};

    /*
     * Prefer the language of the
     * strongest matched question.
     *
     * This prevents Roman Hindi/Odia
     * questions from incorrectly
     * becoming "mixed".
     */
    if (
        matchedLanguage &&
        answers[matchedLanguage]
    ) {
        return answers[matchedLanguage];
    }

    if (
        language &&
        answers[language]
    ) {
        return answers[language];
    }

    if (answers.en) {
        return answers.en;
    }

    const firstAnswer =
        Object.values(answers)
            .find(
                (answer) =>
                    typeof answer ===
                    "string" &&
                    answer.trim()
            );

    return firstAnswer || "";
};

const getIntentSignalScore = (
    question,
    intent
) => {
    const text =
        normalizeSupportQuestion(
            question
        );

    const signals = {
        task_unlock: [
            "unlock",
            "locked",
            "access",
            "unlocking"
        ],
        task_deadline: [
            "deadline",
            "expire",
            "hours",
            "time"
        ],
        task_expired: [
            "expired",
            "expire",
            "deadline",
            "khatam",
            "sari"
        ],
        task_approval: [
            "approval",
            "approve",
            "approved",
            "review"
        ]
    };

    const intentSignals =
        signals[intent];

    if (!intentSignals?.length) {
        return 0;
    }

    const tokens =
        new Set(
            text.split(/\\s+/)
        );

    const matched =
        intentSignals.filter(
            (signal) =>
                tokens.has(signal) ||
                text.includes(signal)
        ).length;

    if (!matched) {
        return 0;
    }

    /*
     * Strong intent-specific signal.
     * This is intentionally kept separate
     * from language scoring.
     */
    return Math.min(
        0.35,
        matched * 0.15
    );
};

const getLanguagePriority = (
    detectedLanguage,
    matchedLanguage
) => {
    if (
        detectedLanguage ===
        matchedLanguage
    ) {
        return 1;
    }

    /*
     * When the detector says mixed,
     * prefer a concrete language variant
     * over a mixed variant.
     */
    if (
        detectedLanguage === "mixed"
    ) {
        if (
            matchedLanguage === "mixed"
        ) {
            return 0;
        }

        if (
            matchedLanguage === "or" ||
            matchedLanguage === "hi" ||
            matchedLanguage === "en"
        ) {
            return 0.8;
        }
    }

    /*
     * Do not let an unrelated language
     * beat a strong matching question.
     */
    return 0;
};

export const findSupportKnowledgeAnswer =
    async (
        question
    ) => {
        const normalizedQuestion =
            normalizeSupportQuestion(
                question
            );

        if (!normalizedQuestion) {
            return null;
        }

        const detectedLanguage =
            detectSupportLanguage(
                question
            );

        const questionTokens =
            tokenize(question);

        if (!questionTokens.length) {
            return null;
        }

        const sources =
            await loadSupportKnowledgeSources();

        const entries =
            flattenSupportEntries(
                sources
            );

        let bestMatch = null;

        for (const entry of entries) {
            const variants =
                getQuestionVariants(
                    entry
                );

            for (const variant of variants) {
                const candidateTokens =
                    tokenize(
                        variant.question
                    );

                const similarity =
                    similarityScore(
                        questionTokens,
                        candidateTokens,
                        variant.language
                    );

                const intentSignal =
                    getIntentSignalScore(
                        question,
                        entry.intent
                    );

                const baseScore =
                    Math.min(
                        1,
                        similarity +
                        intentSignal
                    );

                const languagePriority =
                    getLanguagePriority(
                        detectedLanguage,
                        variant.language
                    );

                /*
                 * For a clearly detected language,
                 * only variants from that language
                 * are eligible.
                 *
                 * This prevents generic technical
                 * words such as "task", "locked",
                 * "deadline" and "help" from making
                 * English variants win over Hindi/Odia.
                 */
                if (
                    detectedLanguage !== "mixed" &&
                    variant.language !== detectedLanguage
                ) {
                    continue;
                }

                /*
                 * For mixed questions, prefer a
                 * concrete language variant when
                 * it has a strong lexical match.
                 * The mixed variant remains available
                 * as a genuine mixed-language fallback.
                 */
                const score =
                    baseScore +
                    languagePriority * 0.20;

                if (
                    !bestMatch ||
                    score >
                        bestMatch.score
                ) {
                    bestMatch = {
                        entry,
                        score,
                        baseScore,
                        matchedQuestion:
                            variant.question,
                        matchedLanguage:
                            variant.language
                    };
                }
            }
        }

        if (
            !bestMatch ||
            bestMatch.baseScore < 0.45
        ) {
            return null;
        }

        const answer =
            getAnswer(
                bestMatch.entry,
                detectedLanguage,
                bestMatch.matchedLanguage
            );

        if (!answer) {
            return null;
        }

        /*
         * Use the strongest matched variant
         * as the answer language.
         *
         * This gives:
         *   Hindi question  -> Hindi answer
         *   Odia question   -> Odia answer
         *   English question -> English answer
         *   Mixed question  -> Mixed answer
         */
        const answerLanguage =
            bestMatch.matchedLanguage ||
            detectedLanguage;

        return {
            answer,
            language: answerLanguage,
            intent:
                bestMatch.entry.intent ||
                null,
            category:
                bestMatch.entry.category ||
                null,
            escalate:
                Boolean(
                    bestMatch.entry.escalate
                ),
            confidence:
                Number(
                    bestMatch.baseScore.toFixed(3)
                ),
            matchedQuestion:
                bestMatch.matchedQuestion,
            matchedLanguage:
                bestMatch.matchedLanguage,
            detectedLanguage,
            sourceFile:
                bestMatch.entry.sourceFile,
            sourceType:
                bestMatch.entry.sourceType
        };
    };
