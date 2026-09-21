import "./LessonSearch.css";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

export default function LessonSearch({
    search,
    setSearch
}) {

    return (
        <motion.div
            className="lesson-search"
            initial={{
                opacity: 0,
                y: -15
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
        >
            <Search
                size={18}
                className="lesson-search-icon"
            />

            <input
                type="text"
                placeholder="Search lesson..."
                value={search}
                onChange={(e)=>
                    setSearch(e.target.value)
                }
            />
            {
                search && (
                    <button
                        onClick={()=>setSearch("")}
                    >
                        <X size={18}/>
                    </button>
                )
            }
        </motion.div>
    );
}