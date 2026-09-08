import { useState } from "react";

import SectionTabs from "../../../layouts/SectionTabs";

import AddNotice from "./components/AddNotice";
import AllNotice from "./components/AllNotice";
import NoticeDetailed from "./components/NoticeDetailed";
import { NOTICE_TABS } from "./constants/notice.constants";

import "./Notice.css";

export default function Notice() {
    const [activeTab, setActiveTab] = useState("add");
    const [editingNotice, setEditingNotice] = useState(null);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [refresh, setRefresh] = useState(0);

    const handleSelectNotice = (notice) => {
        setSelectedNotice(notice);
    };

    const handleEditNotice = (notice) => {
        setSelectedNotice(null);
        setEditingNotice(notice);
        setActiveTab("add");
    };

    const handleSaved = () => {
        setEditingNotice(null);
        setRefresh((current) => current + 1);
        setActiveTab("all");
    };

    const handleTabChange = (tab) => {
        if (tab === "add" && activeTab !== "add") {
            setEditingNotice(null);
        }
        setActiveTab(tab);
    };

    return (
        <section className="admin-notice-page">
            <div className="admin-notice-header">
                <p className="admin-notice-eyebrow">
                    Notice Management
                </p>

                <h1>Notice</h1>

                <p>
                    Create, update, and manage notices for Tech Monster.
                </p>
            </div>

            <SectionTabs
                tabs={NOTICE_TABS}
                activeTab={activeTab}
                onChange={handleTabChange}
            />

            <div className="admin-notice-content">
                {activeTab === "add" && (
                    <AddNotice
                        key={editingNotice?._id || editingNotice?.id || "new"}
                        editNotice={editingNotice}
                        onSaved={handleSaved}
                    />
                )}

                {activeTab === "all" && (
                    <AllNotice
                        refresh={refresh}
                        onSelectNotice={handleSelectNotice}
                    />
                )}
            </div>

            <NoticeDetailed
                open={Boolean(selectedNotice)}
                notice={selectedNotice}
                onClose={() => setSelectedNotice(null)}
                onEdit={handleEditNotice}
            />
        </section>
    );
}
