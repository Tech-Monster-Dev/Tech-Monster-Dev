import { useEffect, useState } from "react";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";

const BADGE_SYNC_EVENT =
    "tech-monster-badge-sync";

export default function useBadgesData() {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBadges = async () => {
            try {
                const { data } = await api.get(
                    API.DASHBOARD.STUDENT
                );

                setBadges(
                    data.dashboard?.badges || []
                );
            } catch (error) {
                console.error(
                    "Failed to load badges:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        const handleBadgeSync = event => {
            const syncedBadges =
                event.detail?.badges;

            if (Array.isArray(syncedBadges)) {
                setBadges(syncedBadges);
            }
        };

        loadBadges();

        window.addEventListener(
            BADGE_SYNC_EVENT,
            handleBadgeSync
        );

        return () => {
            window.removeEventListener(
                BADGE_SYNC_EVENT,
                handleBadgeSync
            );
        };
    }, []);

    return {
        badges,
        loading
    };
}
