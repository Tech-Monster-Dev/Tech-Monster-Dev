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

    const knowledge =
        await findSupportKnowledgeAnswer(
            question
        );

    const shouldEscalate =
        !knowledge ||
        knowledge.escalate;

    const language =
        knowledge?.language || "en";

    const replyText =
        shouldEscalate
            ? (
                FALLBACK_REPLY[language] ||
                FALLBACK_REPLY.en
            )
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
