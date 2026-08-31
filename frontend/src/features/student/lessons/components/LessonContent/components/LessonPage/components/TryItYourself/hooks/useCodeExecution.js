import { useState } from "react";
import api from "../../../../../../../../../../services/api/axios";

export default function useCodeExecution({
    language,
    code,
}) {
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("ready");

    const run = async () => {
        if (!code.trim()) {
            setOutput("");
            setError("Please write some code first.");
            setStatus("error");
            return;
        }

        setStatus("running");
        setOutput("");
        setError("");

        try {
            const response = await api.post(
                "/code-execution/execute",
                {
                    language,
                    code,
                }
            );

            const result = response.data?.data;

            if (result?.status === "success") {
                setOutput(result.output || "No output.");
                setError("");
                setStatus("success");
                return;
            }

            setOutput(result?.output || "");
            setError(
                result?.error ||
                "Code execution failed."
            );

            setStatus(
                result?.status === "timeout"
                    ? "timeout"
                    : "error"
            );
        } catch (requestError) {
            const message =
                requestError?.response?.data?.data?.error ||
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Unable to execute code.";

            setOutput("");
            setError(message);
            setStatus("error");
        }
    };

    const reset = () => {
        setOutput("");
        setError("");
        setStatus("ready");
    };

    return {
        output,
        error,
        status,
        run,
        reset,
    };
}
