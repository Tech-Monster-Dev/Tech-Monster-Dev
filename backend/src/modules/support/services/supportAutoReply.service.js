import {
    createSupportMessage,
    updateSupportConversation
} from "./supportMessage.helper.js";

import {
    notifySupportReceiver
} from "./supportNotification.service.js";

import {
    findSupportKnowledgeAnswer
} from "../knowledge/supportKnowledgeMatcher.js";

import {
    detectSupportLanguage
} from "../knowledge/supportLanguage.js";

const GREETING_REPLIES = {
    en: "Hello! Welcome to Tech Monster Help & Support. Please tell me what you need help with.",
    or: "Namaskar! Tech Monster Help & Support ku swagat. Apananku keun bisayare help darkar, dayakari kuhantu.",
    hi: "Namaste! Tech Monster Help & Support mein aapka swagat hai. Kripya batayein, aapko kis baat mein madad chahiye.",
    mixed: "Namaskar! Welcome to Tech Monster Help & Support. Tumaku keun bisayare help darkar, dayakari kuhantu."
};

const normalizeGreeting = (value) => String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export const detectGreetingLanguage = (value) => {
    const text = normalizeGreeting(value);

    if (/[\u0B00-\u0B7F]/.test(text)) return "or";
    if (/[\u0900-\u097F]/.test(text)) return "hi";

    if (/^(namaste|kaise ho|kaise hain|kya haal hai)$/.test(text)) return "hi";
    if (/^(kemiti achha|kemiti acha)$/.test(text)) return "or";
    if (/^(namaskar|namaskara)$/.test(text)) return "mixed";

    return "en";
};

export const isGreetingOnly = (value) => {
    const text = normalizeGreeting(value);

    return /^(hi+|hey+|hello+|helo+|hallo+|good morning|good afternoon|good evening|namaste|namaskar|namaskara|kemiti achha|kemiti acha|नमस्ते|नमस्कार|हाय|हेलो|ନମସ୍କାର|ହାଏ)$/.test(text);
};

const FALLBACK_REPLY = {
    en: "I could not find a reliable answer to your question. Please wait, our Tech Monster support team will connect with you shortly.",
    or: "Mu tumara question ra reliable answer pai parili nahi. Dayakari wait kara, Tech Monster support team tum saha khub shighra connect karibe.",
    hi: "Mujhe aapke question ka reliable answer nahi mila. Kripya wait karein, Tech Monster support team aapse jald hi connect karegi.",
    mixed: "Mu tumara question ra reliable answer pai parilini. Please wait kara, Tech Monster support team tum saha khub shighra connect karibe."
};

export const sendSupportAutoReply = async ({
    conversation,
    student,
    question,
    studentMessage
}) => {
    if (
        !conversation?._id ||
        !student?._id ||
        !question?.trim()
    ) {
        return null;
    }

    const admin =
        conversation.assignedAdmin;

    if (!admin) {
        return null;
    }

    if (isGreetingOnly(question)) {
        const language = detectGreetingLanguage(question);
        const autoReply = await createSupportMessage({
            conversation,
            user: admin,
            receiver: student._id,
            message: GREETING_REPLIES[language] || GREETING_REPLIES.en,
            file: ""
        });

        const updatedConversation = await updateSupportConversation({
            conversation,
            messageId: autoReply._id,
            isStudent: false
        });

        await notifySupportReceiver({
            receiver: student._id,
            sender: admin,
            message: autoReply,
            conversation: updatedConversation,
            createNotification: false
        });

        return {
            message: autoReply,
            conversation: updatedConversation,
            knowledge: { intent: "greeting", language, escalate: false },
            escalated: false
        };
    }

    const knowledge = await findSupportKnowledgeAnswer(question);
    const language = knowledge?.language || detectSupportLanguage(question);
    const wasAwaitingClarification = Boolean(conversation.awaitingClarification);
    const isClarificationIntent = knowledge?.intent === "unknown_support_question";
    const needsClarification = !knowledge || isClarificationIntent;
    const shouldEscalate = knowledge?.intent === "support_unresolved" || Boolean(knowledge && knowledge.escalate && !isClarificationIntent) || (needsClarification && wasAwaitingClarification);
    const clarificationReplies = {
        en: "Please describe your question or issue in a little more detail so I can check the available support information.",
        or: "Dayakari tumara question ba issue bisayare tike adhika detail re kuhantu, jaha dwara mu available support information check kariparibi.",
        hi: "Kripya apne question ya issue ke baare mein thodi aur jaankari dein, taaki main available support information check kar sakun.",
        mixed: "Tumara question ba issue bisayare tike adhika detail re kuhantu, so mu available support information check kariparibi."
    };
    const replyText = shouldEscalate
        ? (FALLBACK_REPLY[language] || FALLBACK_REPLY.en)
        : needsClarification
            ? (clarificationReplies[language] || clarificationReplies.en)
            : knowledge.answer;

    /*
     * Auto-reply is stored as an actual
     * support message from the assigned admin.
     */
    const autoReply =
        await createSupportMessage({
            conversation,
            user: admin,
            receiver: student._id,
            message: replyText,
            file: ""
        });

    const updatedConversation =
        await updateSupportConversation({
            conversation,
            messageId: autoReply._id,
            isStudent: false
        });

    updatedConversation.awaitingClarification =
        needsClarification && !shouldEscalate;
    await updatedConversation.save();

    /*
     * Auto-reply must NEVER create a
     * notification for the student.
     *
     * The student still receives the
     * message through the support socket.
     */
    await notifySupportReceiver({
        receiver: student._id,
        sender: admin,
        message: autoReply,
        conversation: updatedConversation,
        createNotification: false
    });

    /*
     * Only an escalated/unknown question
     * creates an admin notification.
     *
     * The ORIGINAL student message is
     * used for the notification.
     */
    if (
        shouldEscalate &&
        studentMessage
    ) {
        updatedConversation.status = "pending";
        updatedConversation.autoReplyDisabled = true;
        await updatedConversation.save();

        await notifySupportReceiver({
            receiver: admin._id || admin,
            sender: student,
            message: studentMessage,
            conversation: updatedConversation,
            createNotification: true
        });
    }

    return {
        message: autoReply,
        conversation: updatedConversation,
        knowledge,
        escalated: shouldEscalate
    };
};
