import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getApprovedTasks, getAllSubmissions } from "../../../../../services/api/adminTask.service";

import "./ApprovedTasks.css";
import EmptyState from "../../../../../components/ui/EmptyState";

export default function ApprovedTasks({ refresh }) {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [tasks, setTasks] = useState([]);

    const loadTasks = async () => {

        try {

            // Approved submissions from the new submission flow.
            const res = await getAllSubmissions("approved");

            setTasks(res.submissions || []);

        }

        catch (error) {

            // Fall back to legacy approved tasks if the new endpoint fails.
            try {
                const legacy = await getApprovedTasks();
                setTasks(legacy.tasks || []);
            } catch {
                console.log(error);
            }

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        queueMicrotask(() => {
            loadTasks();
        });

    }, [refresh]);

    if (loading) {

        return (

            <div id="approvedTasks">

                <h1>Approved Tasks :</h1>

                <p>Loading...</p>

            </div>

        );

    }

    return (

        <div id="approvedTasks">

            <h1>

                Approved Tasks

                <span>

                    {" "}({tasks.length})

                </span>

            </h1>

            <div id="approvedTasksNotify">

                {

                    tasks.length === 0 && (

                        <EmptyState
                            heading="No Approved Tasks Yet"
                            paragraph="There are no approved tasks to display right now."
                        />

                    )

                }

                {

                    tasks.map((task, index) => (

                        <div

                            key={task._id}

                            className="approvedTasksNotifyList"

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

                            <div className="approvedTasksNotifyContent">

                                <h3>

                                    {task.student?.firstName || task.assignedTo?.firstName}{" "}

                                    {task.student?.lastName || task.assignedTo?.lastName}

                                </h3>

                                <p>

                                    Internship :

                                    {" "}

                                    {task.internship?.title || task.courseSlug || "—"}

                                </p>

                                <p>

                                    Task :

                                    {" "}

                                    {task.taskTitle || task.title || "—"}

                                </p>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}
