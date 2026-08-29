import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPendingTasks, getAllSubmissions } from "../../../../../services/api/adminTask.service";
import { socket } from "../../../../../services/socket/socket";

import "./PendingTaskApprove.css";
import EmptyState from "../../../../../components/ui/EmptyState";

export default function PendingTaskApprove({ refresh }) {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [tasks, setTasks] = useState([]);

    const loadTasks = async () => {

        try {

            // Pending submissions plus expired tasks that may need extension.
            const [pendingRes, expiredRes] = await Promise.all([
                getAllSubmissions("pending"),
                getAllSubmissions("expired")
            ]);

            setTasks([
                ...(pendingRes.submissions || []),
                ...(expiredRes.submissions || [])
            ]);

        } catch (error) {

            // Fall back to legacy pending tasks if the new endpoint fails.
            try {
                const legacy = await getPendingTasks();
                setTasks(legacy.tasks || []);
            } catch {
                console.log(error);
            }

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        queueMicrotask(() => {
            loadTasks();
        });

    }, [refresh]);

    useEffect(() => {

        socket.on("taskSubmitted", () => {

            queueMicrotask(() => {
                loadTasks();
            });

        });

        return () => {

            socket.off("taskSubmitted");

        };

    }, []);

    if (loading) {

        return (

            <div id="pendingTasksApprove">

                <h1>Pending :</h1>

                <p>Loading...</p>

            </div>

        );

    }

    return (

        <div id="pendingTasksApprove">

            <h1>

                Pending :

                <span>

                    {" "}({tasks.length})

                </span>

            </h1>

            <div id="pendingTasksApproveNotify">

                {

                    tasks.length === 0 && (

                        <EmptyState
                            heading="No Pending Tasks"
                            paragraph="There are no tasks waiting for approval right now."
                        />

                    )

                }

                {
                    tasks.map((task, index) => (

                        <div

                            key={task._id}

                            className="pendingTasksApproveNotifyList"

                            onClick={() =>

                                navigate(

                                    `/admin/tasks/${task._id}`

                                )

                            }

                        >

                            <div className="recentSerielNum">

                                <p>

                                    {index + 1}

                                </p>

                            </div>

                            <div className="pendingTasksApproveNotifyContent">

                                <h3>

                                    {

                                        task.student?.firstName || task.assignedTo?.firstName

                                    }{" "}

                                    {

                                        task.student?.lastName || task.assignedTo?.lastName

                                    }

                                </h3>

                                <p>

                                    Internship :

                                    {" "}

                                    {

                                        task.internship?.title || task.courseSlug || "—"

                                    }

                                </p>

                                <p>

                                    Task :

                                    {" "}

                                    {

                                        task.taskTitle || task.title || "—"

                                    }

                                </p>

                                {task.status === "expired" && (
                                    <p className="expiredTaskLabel">
                                        Expired - extension required
                                    </p>
                                )}

                            </div>

                        </div>

                    ))
                }

            </div>

        </div>

    );

}
