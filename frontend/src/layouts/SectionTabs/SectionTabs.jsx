import { motion } from "framer-motion";

import "./SectionTabs.css";

const SectionTabs = ({
    tabs = [],
    activeTab,
    onChange,
    className = "",
}) => {
    return (
        <nav
            className={`section-tabs ${className}`.trim()}
            aria-label="Section navigation"
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.value;

                return (
                    <motion.button
                        key={tab.value}
                        type="button"
                        className={`section-tab ${isActive ? "active" : ""}`}
                        onClick={() => onChange?.(tab.value)}
                        whileTap={{ scale: 0.97 }}
                    >
                        {tab.icon && (
                            <span className="section-tab-icon">
                                {tab.icon}
                            </span>
                        )}

                        <span>{tab.label}</span>

                        {tab.count !== undefined && (
                            <span className="section-tab-count">
                                {tab.count}
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </nav>
    );
};

export default SectionTabs;
