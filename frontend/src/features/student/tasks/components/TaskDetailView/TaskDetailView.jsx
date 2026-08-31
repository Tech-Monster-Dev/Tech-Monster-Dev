import { useState } from "react";
import { motion } from "framer-motion";
import {
    FiTarget,
    FiHelpCircle,
    FiCode,
    FiCheckCircle,
    FiInfo,
    FiBookOpen,
} from "react-icons/fi";

import TaskSolution from "../TaskSolution/TaskSolution";

import "./TaskDetailView.css";

export default function TaskDetailView({ task }) {
    const [showSolution, setShowSolution] =
        useState(false);

    if (!task) {
        return (
            <div className="task-detail-empty">
                Select a task from the sidebar to view its details.
            </div>
        );
    }

    const requirements =
        Array.isArray(task.requirements)
            ? task.requirements
            : Array.isArray(task.objectives)
                ? task.objectives
                : [];

    const hints = Array.isArray(task.hints)
        ? task.hints
        : task.hint
            ? [task.hint]
            : [];

    const hasSolution =
        Boolean(task.solutionCode?.trim()) ||
        Boolean(task.solutionExplanation?.trim());

    return (
        <motion.div
            className="task-detail-view"
            initial={{
                opacity: 0,
                y: 16,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.4,
            }}
        >
            {/* =========================================
                TASK HEADER
            ========================================= */}

            <div className="task-detail-head">
                <div className="task-detail-badge">
                    <FiCode />
                </div>

                <div>
                    <span className="task-detail-level">
                        {task.level || "Task"}
                    </span>

                    <h2>
                        {task.title}
                    </h2>
                </div>
            </div>


            {/* =========================================
                TASK QUESTION
            ========================================= */}

            <div className="task-detail-section">
                <div className="task-detail-section-title">
                    <FiTarget />

                    <h3>
                        Task Question
                    </h3>
                </div>

                <p className="task-detail-problem">
                    {task.problemStatement ||
                        task.description ||
                        "Complete the task based on the lesson you have studied."}
                </p>
            </div>


            {/* =========================================
                REQUIREMENTS
            ========================================= */}

            {requirements.length > 0 && (
                <div className="task-detail-section">
                    <div className="task-detail-section-title">
                        <FiCheckCircle />

                        <h3>
                            Requirements
                        </h3>
                    </div>

                    <ul className="task-detail-list">
                        {requirements.map(
                            (requirement, index) => (
                                <li key={index}>
                                    {requirement}
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}


            {/* =========================================
                HINT
            ========================================= */}

            {hints.length > 0 && (
                <div
                    className="
                        task-detail-section
                        task-detail-hints
                    "
                >
                    <div className="task-detail-section-title">
                        <FiHelpCircle />

                        <h3>
                            Hint
                        </h3>
                    </div>

                    <ul className="task-detail-list">
                        {hints.map(
                            (hint, index) => (
                                <li key={index}>
                                    {hint}
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}


            {/* =========================================
                BEFORE YOU SUBMIT
            ========================================= */}

            <div className="task-detail-submit-info">
                <div className="task-detail-submit-info-header">
                    <FiInfo />

                    <h3>
                        Before You Submit
                    </h3>
                </div>

                <div className="task-detail-submit-info-content">
                    <p>
                        Read the task question carefully
                        and understand what you need to
                        build before writing your code.
                    </p>

                    <p>
                        Write and run your solution in
                        your local VS Code environment.
                    </p>

                    <p>
                        Test your code properly and make
                        sure the output or result is
                        correct.
                    </p>

                    <p>
                        Once you are satisfied with your
                        solution, copy the code you wrote
                        and paste it into the Submit Code
                        section below.
                    </p>

                    <p>
                        Finally, click the
                        <strong> Submit </strong>
                        button to submit your task for
                        review.
                    </p>
                </div>

                {/* =========================================
                    SOLUTION ACTION
                ========================================= */}

                {hasSolution && (
                    <div className="task-detail-solution-action">
                        <button
                            type="button"
                            className="task-detail-solution-btn"
                            onClick={() =>
                                setShowSolution(
                                    (previous) => !previous
                                )
                            }
                        >
                            <FiBookOpen />

                            <span>
                                {showSolution
                                    ? "Hide Solution"
                                    : "Show Solution"}
                            </span>
                        </button>

                        <div className="task-detail-solution-info">
                            <FiInfo />

                            <span>
                                If you cannot understand or
                                complete this task, you can
                                view the solution for guidance.
                            </span>
                        </div>
                    </div>
                )}
            </div>


            {/* =========================================
                SOLUTION
            ========================================= */}

            {showSolution && hasSolution && (
                <TaskSolution
                    solutionCode={
                        task.solutionCode || ""
                    }
                    solutionExplanation={
                        task.solutionExplanation || ""
                    }
                    language={
                        task.language || "javascript"
                    }
                />
            )}
        </motion.div>
    );
}
