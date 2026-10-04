import "./NotificationModal.css";

import { useState } from "react";
import { toast } from "react-toastify";

import api from "../../../../../services/api/axios";

export default function NotificationModal({
    open,
    student,
    onClose
}) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            await api.post("/notifications", {
                user: student._id,
                title,
                message,
                type: "system"
            });

            toast.success("Notification Sent");
            setTitle("");
            setMessage("");
            onClose();

        } catch (err) {
            console.log(err.response?.data);
            toast.error(
                err.response?.data?.message ||
                "Failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="notifyOverlay">
            <div className="notifyModal">
                <h2>
                    Send Notification
                </h2>

                <p>
                    {student.firstName} {student.lastName}
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Notification Title"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        required
                    />

                    <textarea
                        placeholder="Notification Message"
                        value={message}
                        onChange={(e) =>
                            setMessage(e.target.value)
                        }
                        required
                    />

                    <div className="notifyBtns">
                        <button
                            type="button"
                            className="cancelNotify"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="sendNotify"
                            disabled={loading}
                        >
                            {
                                loading
                                    ? "Sending..."
                                    : "Send"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}