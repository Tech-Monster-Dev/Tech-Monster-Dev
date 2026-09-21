import "./Pagination.css";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
    current,
    total,
    onPrevious,
    onNext
}) {

    return (
        <motion.div
            className="lesson-pagination"
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
        >
            <button
                className="pagination-btn"
                disabled={current === 0}
                onClick={onPrevious}
            >
                <ChevronLeft size={18} />
                Previous
            </button>

            <div className="pagination-center">
                <span className="pagination-text">
                    Lesson
                    <strong>
                        {current + 1}
                    </strong>
                    of
                    <strong>
                        {total}
                    </strong>
                </span>

                <div className="pagination-dots">
                    {(() => {
                        const visibleCount = Math.min(4, total);
                        if (visibleCount === 0) {
                            return null;
                        }
                        const maxStart = Math.max(
                            0,
                            total - visibleCount
                        );
                        const start = Math.min(
                            current,
                            maxStart
                        );
                        const visibleIndexes = Array.from(
                            { length: visibleCount },
                            (_, offset) => start + offset
                        );

                        return visibleIndexes.map((index) => (
                            <motion.div
                                key={index}
                                className={`pagination-dot ${
                                    index === current ? "active" : ""
                                }`}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{
                                    scale: 1.25
                                }}
                            />
                        ));
                    })()}
                </div>
            </div>

            <button
                className="pagination-btn"
                disabled={current === total - 1}
                onClick={onNext}
            >
                Next
                <ChevronRight size={18} />
            </button>
        </motion.div>
    );
}