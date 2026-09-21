import "./Bookmark.css";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";


export default function LessonBookmark({
    bookmarked,
    onToggle
}) {

    return (

        <motion.button
            className={`bookmark-btn ${bookmarked ? "active" : ""}`}
            whileHover={{
                scale: 1.08
            }}
            whileTap={{
                scale: .95
            }}
            onClick={onToggle}
        >
            {bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}

            {bookmarked ? "Bookmarked" : "Bookmark"}

        </motion.button>

    );

}