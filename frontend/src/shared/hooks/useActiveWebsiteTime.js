import { useEffect, useRef } from "react";
import { recordActiveTime } from "../../services/api/attendance.service";

const HEARTBEAT_INTERVAL = 30 * 1000;
const LIVE_TICK_INTERVAL = 1000;

export default function useActiveWebsiteTime(
    enabled = false,
    onActiveTimeChange = null,
    initialMilliseconds = 0
) {
    const totalMillisecondsRef = useRef(
        Math.max(
            0,
            Math.floor(initialMilliseconds || 0)
        )
    );

    const pendingMillisecondsRef = useRef(0);
    const lastTickRef = useRef(null);
    const activeRef = useRef(false);

    const callbackRef = useRef(
        onActiveTimeChange
    );

    useEffect(() => {
        callbackRef.current =
            onActiveTimeChange;
    }, [onActiveTimeChange]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (
            Number.isFinite(initialMilliseconds) &&
            initialMilliseconds >= 0
        ) {
            totalMillisecondsRef.current =
                Math.floor(initialMilliseconds);
        }
    }, [enabled, initialMilliseconds]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const notify = () => {
            callbackRef.current?.(
                totalMillisecondsRef.current
            );
        };

        const addElapsedTime = () => {
            if (
                !activeRef.current ||
                !lastTickRef.current
            ) {
                return;
            }

            const now = Date.now();

            const elapsed =
                now - lastTickRef.current;

            if (elapsed <= 0) {
                return;
            }

            totalMillisecondsRef.current +=
                elapsed;

            pendingMillisecondsRef.current +=
                elapsed;

            lastTickRef.current = now;

            notify();
        };

        const flush = async () => {
            const seconds = Math.floor(
                pendingMillisecondsRef.current /
                    1000
            );

            if (seconds <= 0) {
                return;
            }

            pendingMillisecondsRef.current -=
                seconds * 1000;

            try {
                const response =
                    await recordActiveTime(seconds);

                window.dispatchEvent(
                    new CustomEvent(
                        "tech-monster-badge-sync",
                        {
                            detail: {
                                activeSeconds:
                                    response?.activeSeconds || 0,
                                badges:
                                    response?.badges || []
                            }
                        }
                    )
                );
            } catch (error) {
                pendingMillisecondsRef.current +=
                    seconds * 1000;

                console.error(
                    "Active time sync failed:",
                    error
                );
            }
        };

        const startTracking = () => {
            if (
                document.visibilityState !==
                "visible"
            ) {
                return;
            }

            if (activeRef.current) {
                return;
            }

            activeRef.current = true;
            lastTickRef.current = Date.now();

            notify();
        };

        const stopTracking = async () => {
            if (!activeRef.current) {
                return;
            }

            addElapsedTime();

            activeRef.current = false;
            lastTickRef.current = null;

            await flush();
        };

        const liveTick = () => {
            if (
                document.visibilityState !==
                "visible"
            ) {
                return;
            }

            if (!activeRef.current) {
                startTracking();
                return;
            }

            addElapsedTime();
        };

        const heartbeat = async () => {
            if (!activeRef.current) {
                return;
            }

            addElapsedTime();

            await flush();
        };

        const handleVisibilityChange = () => {
            if (
                document.visibilityState ===
                "visible"
            ) {
                startTracking();
            } else {
                stopTracking();
            }
        };

        const handleWindowBlur = () => {
            stopTracking();
        };

        const handleWindowFocus = () => {
            if (
                document.visibilityState ===
                "visible"
            ) {
                startTracking();
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        window.addEventListener(
            "blur",
            handleWindowBlur
        );

        window.addEventListener(
            "focus",
            handleWindowFocus
        );

        const liveTimer =
            window.setInterval(
                liveTick,
                LIVE_TICK_INTERVAL
            );

        const heartbeatTimer =
            window.setInterval(
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

            window.removeEventListener(
                "blur",
                handleWindowBlur
            );

            window.removeEventListener(
                "focus",
                handleWindowFocus
            );

            window.clearInterval(
                liveTimer
            );

            window.clearInterval(
                heartbeatTimer
            );

            addElapsedTime();

            activeRef.current = false;

            flush();
        };
    }, [enabled]);
}
