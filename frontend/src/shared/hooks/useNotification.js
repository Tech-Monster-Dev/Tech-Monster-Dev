import { useContext } from "react";

import NotificationContext
    from "../../providers/Notification/NotificationContext";


export default function useNotification() {

    const context =
        useContext(NotificationContext);


    if (!context) {

        throw new Error(
            "useNotification must be used inside NotificationProvider"
        );

    }


    return context;

}