import { useEffect, useRef } from "react";
import { recordActiveTime } from "../../services/api/attendance.service";

const HEARTBEAT_INTERVAL = 30 * 1000;
const LIVE_TICK_INTERVAL = 1000;
const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

const getIndiaDateKey = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

const getNextIndiaMidnight = (dateKey) => new Date(`${dateKey}T00:00:00+05:30`).getTime() + DAY_MILLISECONDS;

export default function useActiveWebsiteTime(
    enabled = false,
    onActiveTimeChange = null,
    initialMilliseconds = 0
) {
    const totalMillisecondsRef = useRef(
        Math.max(0, Math.floor(initialMilliseconds || 0))
    );

    // Each India date has its own pending-time bucket.
    const pendingByDateRef = useRef(new Map());
    const lastTickRef = useRef(null);
    const activeRef = useRef(false);
    const displayDateKeyRef = useRef(getIndiaDateKey());
    const flushPromiseRef = useRef(null);
    const callbackRef = useRef(onActiveTimeChange);

    useEffect(() => {
        callbackRef.current = onActiveTimeChange;
    }, [onActiveTimeChange]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (!activeRef.current) {
            totalMillisecondsRef.current = Math.max(0, Math.floor(initialMilliseconds || 0));
        }

        displayDateKeyRef.current = getIndiaDateKey();
    }, [enabled, initialMilliseconds]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const notify = () => {
            callbackRef.current?.(totalMillisecondsRef.current);
        };

        const syncDisplayDate = () => {
            const todayKey = getIndiaDateKey();

            if (displayDateKeyRef.current !== todayKey) {
                displayDateKeyRef.current = todayKey;
                totalMillisecondsRef.current = 0;
                notify();
            }
        };

        const addPendingTime = (dateKey, milliseconds) => {
            if (milliseconds <= 0) {
                return;
            }

            const pending = pendingByDateRef.current;
            pending.set(
                dateKey,
                (pending.get(dateKey) || 0) + milliseconds
            );
        };

        const addElapsedTime = () => {
            if (!activeRef.current || lastTickRef.current === null) {
                syncDisplayDate();
                return;
            }

            const now = Date.now();
            let cursor = lastTickRef.current;

            if (now <= cursor) {
                return;
            }

            // Split elapsed time at each Asia/Kolkata midnight.
            while (cursor < now) {
                const dateKey = getIndiaDateKey(new Date(cursor));
                const nextMidnight = getNextIndiaMidnight(dateKey);
                const segmentEnd = Math.min(now, nextMidnight);
                const elapsed = segmentEnd - cursor;

                if (elapsed <= 0) {
                    break;
                }

                if (displayDateKeyRef.current !== dateKey) {
                    displayDateKeyRef.current = dateKey;
                    totalMillisecondsRef.current = 0;
                }

                addPendingTime(dateKey, elapsed);
                totalMillisecondsRef.current += elapsed;

                cursor = segmentEnd;
            }

            lastTickRef.current = now;
            syncDisplayDate();
            notify();
        };

        const flush = () => {
            if (flushPromiseRef.current) {
                return flushPromiseRef.current;
            }

            const runFlush = async () => {
                const pending = pendingByDateRef.current;

                for (const [dateKey, milliseconds] of [...pending.entries()]) {
                    const seconds = Math.floor(milliseconds / 1000);

                    if (seconds <= 0) {
                        continue;
                    }

                    const remainingMilliseconds =
                        milliseconds - seconds * 1000;

                    if (remainingMilliseconds > 0) {
                        pending.set(dateKey, remainingMilliseconds);
                    } else {
                        pending.delete(dateKey);
                    }

                    try {
                        const response = await recordActiveTime(
                            seconds,
                            dateKey
                        );

                        window.dispatchEvent(
                            new CustomEvent("tech-monster-badge-sync", {
                                detail: {
                                    activeSeconds:
                                        response?.activeSeconds || 0,
                                    badges: response?.badges || []
                                }
                            })
                        );
                    } catch (error) {
                        // Restore failed seconds to the same date bucket.
                        addPendingTime(dateKey, seconds * 1000);

                        console.error(
                            `Active time sync failed for ${dateKey}:`,
                            error
                        );
                    }
                }
            };

            flushPromiseRef.current = runFlush().finally(() => {
                flushPromiseRef.current = null;
            });

            return flushPromiseRef.current;
        };

        const isTrackingEligible = () =>
            document.visibilityState === "visible" &&
            document.hasFocus();

        const startTracking = () => {
            syncDisplayDate();

            if (!isTrackingEligible() || activeRef.current) {
                return;
            }

            activeRef.current = true;
            lastTickRef.current = Date.now();
            notify();
        };

        const stopTracking = async () => {
            if (!activeRef.current) {
                syncDisplayDate();
                await flush();
                return;
            }

            addElapsedTime();

            activeRef.current = false;
            lastTickRef.current = null;

            await flush();
        };

        const liveTick = () => {
            syncDisplayDate();

            if (!isTrackingEligible()) {
                if (activeRef.current) {
                    void stopTracking();
                }
                return;
            }

            if (!activeRef.current) {
                startTracking();
                return;
            }

            addElapsedTime();
        };

        const heartbeat = async () => {
            if (activeRef.current) {
                addElapsedTime();
            }

            await flush();
        };

        const handleVisibilityChange = () => {
            if (isTrackingEligible()) {
                startTracking();
            } else {
                void stopTracking();
            }
        };

        const handleWindowBlur = () => {
            void stopTracking();
        };

        const handleWindowFocus = () => {
            if (isTrackingEligible()) {
                startTracking();
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);

        const liveTimer = window.setInterval(
            liveTick,
            LIVE_TICK_INTERVAL
        );

        const heartbeatTimer = window.setInterval(
            heartbeat,
            HEARTBEAT_INTERVAL
        );

        startTracking();
        notify();

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);

            window.clearInterval(liveTimer);
            window.clearInterval(heartbeatTimer);

            addElapsedTime();

            activeRef.current = false;
            lastTickRef.current = null;

            // Start flushing pending activity immediately during cleanup.
            // The regular heartbeat remains responsible for normal persistence.
            void flush();
        };
    }, [enabled]);
}