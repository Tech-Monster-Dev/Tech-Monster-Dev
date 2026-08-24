import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { toast } from "react-toastify";

import { socket } from "../../../../services/socket/socket";

import { getTaskKey } from "../utils/taskUtils";

const useTaskRealtime = ({
    user,
    courseSlug,
    applySubmissionState,
    setActiveTaskId,
}) => {
    useEffect(() => {

        console.log(
            "🔥 TASK REALTIME EFFECT START",
            {
                userId: user?._id || user?.id,
                courseSlug,
                socketConnected: socket.connected,
                socketId: socket.id,
            }
        );

        if (!user?._id && !user?.id) {

            console.log(
                "❌ TASK REALTIME: NO USER"
            );

            return;
        }

        const userId = String(
            user._id || user.id
        );

        const handleConnect = () => {

            console.log(
                "🟢 TASK SOCKET CONNECTED:",
                socket.id
            );

            console.log(
                "👤 TASK SOCKET JOIN:",
                userId
            );

            socket.emit(
                "join",
                userId
            );
        };

        const handleDisconnect = (reason) => {

            console.log(
                "🔴 TASK SOCKET DISCONNECTED:",
                reason
            );
        };

        const handleConnectError = (error) => {

            console.error(
                "❌ TASK SOCKET ERROR:",
                error.message
            );
        };

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "connect_error",
            handleConnectError
        );

        if (!socket.connected) {

            console.log(
                "🔌 TASK SOCKET CONNECTING..."
            );

            socket.connect();

        } else {

            console.log(
                "🟢 TASK SOCKET ALREADY CONNECTED:",
                socket.id
            );

            socket.emit(
                "join",
                userId
            );
        }

        const handleApproved = ({
            submission,
            unlockedSubmission,
        }) => {

            console.log(
                "🚨🚨 TASK APPROVED EVENT RECEIVED 🚨🚨",
                {
                    submission,
                    unlockedSubmission,
                    socketId: socket.id,
                    connected: socket.connected,
                }
            );
            if (submission) {
                applySubmissionState(submission);

                toast.success(
                    `Approved: ${submission.taskTitle ||
                    submission.taskId
                    }`
                );
            }

            if (unlockedSubmission) {
                applySubmissionState(
                    unlockedSubmission
                );

                const unlockedTaskKey =
                    getTaskKey(unlockedSubmission);

                toast.info(
                    `Unlocked: ${unlockedSubmission.taskTitle ||
                    unlockedSubmission.taskId
                    }`
                );

                if (unlockedTaskKey) {
                    setActiveTaskId(unlockedTaskKey);
                }
            }
        };

        const handleExtended = ({ submission }) => {
            if (!submission) return;

            applySubmissionState(submission);

            toast.success(
                `Deadline extended: ${submission.taskTitle ||
                submission.taskId
                }`
            );
        };

        const handleExpired = ({ submission }) => {
            if (!submission) return;

            applySubmissionState(submission);

            toast.error(
                `Expired: ${submission.taskTitle ||
                submission.taskId
                }`
            );
        };

        const handleUnlocked = ({ submission }) => {
            if (!submission) return;

            applySubmissionState(submission);

            const taskKey = getTaskKey(submission);

            toast.info(
                `Unlocked: ${submission.taskTitle ||
                submission.taskId
                }`
            );

            if (taskKey) {
                setActiveTaskId(taskKey);
            }
        };

        const handleRejected = ({ submission }) => {
            if (!submission) return;

            applySubmissionState(submission);

            toast.warning(
                `Needs correction: ${submission.taskTitle ||
                submission.taskId
                }`
            );
        };

        socket.on(
            "taskApproved",
            handleApproved
        );

        socket.on(
            "taskDeadlineExtended",
            handleExtended
        );

        socket.on(
            "taskExpired",
            handleExpired
        );

        socket.on(
            "taskUnlocked",
            handleUnlocked
        );

        socket.on(
            "taskRejected",
            handleRejected
        );

        return () => {

            console.log(
                "🧹 TASK REALTIME CLEANUP"
            );

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "connect_error",
                handleConnectError
            );

            socket.off(
                "taskApproved",
                handleApproved
            );

            socket.off(
                "taskDeadlineExtended",
                handleExtended
            );

            socket.off(
                "taskExpired",
                handleExpired
            );

            socket.off(
                "taskUnlocked",
                handleUnlocked
            );

            socket.off(
                "taskRejected",
                handleRejected
            );
        };
    }, [
        user?._id,
        user?.id,
        courseSlug,
        applySubmissionState,
        setActiveTaskId,
    ]);
};

export default useTaskRealtime;
