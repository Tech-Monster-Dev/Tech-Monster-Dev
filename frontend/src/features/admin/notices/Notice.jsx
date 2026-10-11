import "./Notice.css";
import { useEffect, useState } from "react";

const NOTICE_TAB_STORAGE_KEY = "admin-notice-active-tab";
const NOTICE_MODAL_STORAGE_KEY = "admin-notice-selected-modal";

import SectionTabs from "../../../layouts/SectionTabs";

import AddNotice from "./components/AddNotice";
import AllNotice from "./components/AllNotice";
import NoticeDetailed from "./components/NoticeDetailed";
import { NOTICE_TABS } from "./constants/notice.constants";


export default function Notice() {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = sessionStorage.getItem(NOTICE_TAB_STORAGE_KEY);
        return NOTICE_TABS.some((tab) => tab.value === savedTab)
            ? savedTab
            : "add";
    });
    const [editingNotice, setEditingNotice] = useState(null);
    const [selectedNotice, setSelectedNotice] = useState(() => {
        try {
            const savedNotice = sessionStorage.getItem(NOTICE_MODAL_STORAGE_KEY);
            return savedNotice ? JSON.parse(savedNotice) : null;
        } catch {
            sessionStorage.removeItem(NOTICE_MODAL_STORAGE_KEY);
            return null;
        }
    });
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        sessionStorage.setItem(NOTICE_TAB_STORAGE_KEY, activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (selectedNotice) {
            sessionStorage.setItem(
                NOTICE_MODAL_STORAGE_KEY,
                JSON.stringify(selectedNotice)
            );
        } else {
            sessionStorage.removeItem(NOTICE_MODAL_STORAGE_KEY);
        }
    }, [selectedNotice]);

    const handleSelectNotice = (notice) => {
        setSelectedNotice(notice);
    };

    const handleCloseNotice = () => {
        setSelectedNotice(null);
    };

    const handleNoticeDeleted = () => {
        setSelectedNotice(null);
        setRefresh((current) => current + 1);
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
                onClose={handleCloseNotice}
                onEdit={handleEditNotice}
                onDeleted={handleNoticeDeleted}
            />
        </section>
    );
}