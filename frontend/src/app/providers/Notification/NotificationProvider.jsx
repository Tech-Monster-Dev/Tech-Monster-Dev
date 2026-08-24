import {
    useCallback,
    useEffect,
    useState
} from "react";

import NotificationContext from "./NotificationContext";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
} from "../../../services/api/notification.service";

import { socket } from "../../../services/socket/socket";

import useAuth from "../../../shared/hooks/useAuth";

import { toast } from "react-toastify";


function NotificationProvider({ children }) {

    const { user, token } = useAuth();
    const userId = user?._id || user?.id;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);


    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    const loadNotifications = useCallback(async () => {

        if (!userId || !token) {
            setNotifications([]);
            return;
        }

        try {

            setLoading(true);

            // console.log(
            //     "📥 Loading notifications for:",
            //     userId
            // );

            const res = await getNotifications();

            // console.log(
            //     "📦 FULL NOTIFICATION RESPONSE:",
            //     res
            // );

            const notificationList =
                Array.isArray(res?.notifications)
                    ? res.notifications
                    : [];

            // console.log(
            //     "📦 NOTIFICATION ARRAY:",
            //     notificationList
            // );

            setNotifications(notificationList);

        } catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

        } finally {

            setLoading(false);

        }

    }, [userId, token]);


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        if (!userId || !token) {
            return;
        }

        // This effect intentionally triggers the initial API load.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications();

    }, [
        loadNotifications,
        userId,
        token
    ]);


    // ==========================================
    // LIVE SOCKET NOTIFICATION
    // ==========================================

    useEffect(() => {

        if (!userId || !token) {
            return;
        }

        const handleConnect = () => {

            // console.log(
            //     "🟢 Notification socket connected:",
            //     socket.id
            // );

            socket.emit(
                "join",
                String(userId)
            );

            // console.log(
            //     "👤 Notification socket joined:",
            //     userId
            // );

        };

        const handleDisconnect = (reason) => {

            console.log(
                "🔴 Notification socket disconnected:",
                reason
            );

        };

        const handleConnectError = (error) => {

            console.error(
                "❌ Notification socket connection error:",
                error.message
            );

        };

        const handleNewNotification = (notification) => {

            console.log(
                "🔔 LIVE NOTIFICATION RECEIVED:",
                notification
            );

            setNotifications((prev) => [

                notification,

                ...prev.filter(
                    (item) =>
                        item._id !== notification._id
                )

            ]);

            toast.info(

                <div>

                    <strong>
                        {notification.title}
                    </strong>

                    <div
                        style={{
                            marginTop: "4px"
                        }}
                    >
                        {notification.message}
                    </div>

                </div>

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

        socket.on(
            "newNotification",
            handleNewNotification
        );

        if (!socket.connected) {

            // console.log(
            //     "🔌 Connecting notification socket..."
            // );

            socket.connect();

        } else {

            handleConnect();

        }

        return () => {

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
                "newNotification",
                handleNewNotification
            );

        };

    }, [userId, token]);


    // ==========================================
    // MARK SINGLE AS READ
    // ==========================================

    const markAsRead = async (id) => {

        try {

            const res =
                await markNotificationRead(id);


            setNotifications((prev) =>

                prev.map(
                    (notification) =>

                        String(notification._id) ===
                            String(id)

                            ? {
                                ...notification,
                                isRead: true
                            }

                            : notification
                )

            );


            return res;

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

            throw error;

        }

    };


    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    const markAllAsRead = async () => {

        try {

            const res =
                await markAllNotificationsRead();


            setNotifications((prev) =>

                prev.map(
                    (notification) => ({
                        ...notification,
                        isRead: true
                    })
                )

            );


            return res;

        } catch (error) {

            console.error(
                "Failed to mark all notifications:",
                error
            );

            throw error;

        }

    };


    // ==========================================
    // DELETE
    // ==========================================

    const removeNotification = async (id) => {

        try {

            await deleteNotification(id);


            setNotifications((prev) =>

                prev.filter(
                    (notification) =>
                        String(notification._id) !==
                        String(id)
                )

            );

        } catch (error) {

            console.error(
                "Failed to delete notification:",
                error
            );

            throw error;

        }

    };


    // ==========================================
    // UNREAD COUNT
    // ==========================================

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.isRead
        ).length;


    return (

        <NotificationContext.Provider
            value={{

                notifications,

                loading,

                unreadCount,

                loadNotifications,

                markAsRead,

                markAllAsRead,

                removeNotification

            }}
        >

            {children}

        </NotificationContext.Provider>

    );

}


export default NotificationProvider;