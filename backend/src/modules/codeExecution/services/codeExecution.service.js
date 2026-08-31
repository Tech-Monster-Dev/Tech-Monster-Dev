import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const LANGUAGE_CONFIG = {
    javascript: {
        image: "node:22-alpine",
        command: ["node", "/tmp/main.js"],
        filename: "main.js",
    },

    js: {
        image: "node:22-alpine",
        command: ["node", "/tmp/main.js"],
        filename: "main.js",
    },
};

const MAX_CODE_LENGTH = 20_000;
const EXECUTION_TIMEOUT = 10_000;
const MEMORY_LIMIT = "128m";
const CPU_LIMIT = "0.5";

function normalizeLanguage(language) {
    return String(language || "")
        .trim()
        .toLowerCase();
}

export async function executeStudentCode({
    language,
    code,
}) {
    const normalizedLanguage = normalizeLanguage(language);

    if (!LANGUAGE_CONFIG[normalizedLanguage]) {
        return {
            language: normalizedLanguage,
            output: "",
            error: `Language "${normalizedLanguage}" is not supported yet.`,
            status: "error",
        };
    }

    if (typeof code !== "string" || !code.trim()) {
        return {
            language: normalizedLanguage,
            output: "",
            error: "Please write some code before running it.",
            status: "error",
        };
    }

    if (code.length > MAX_CODE_LENGTH) {
        return {
            language: normalizedLanguage,
            output: "",
            error: "Code is too large.",
            status: "error",
        };
    }

    const config = LANGUAGE_CONFIG[normalizedLanguage];

    const containerName =
        `tech-monster-runner-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;

    try {
        const encodedCode = Buffer.from(code, "utf8").toString("base64");

        const shellCommand =
            `echo ${encodedCode} | base64 -d > /tmp/${config.filename} && ` +
            `${config.command.join(" ")}`;

        const { stdout, stderr } = await execFileAsync(
            "docker",
            [
                "run",
                "--rm",
                "--name",
                containerName,

                "--network",
                "none",

                "--memory",
                MEMORY_LIMIT,

                "--cpus",
                CPU_LIMIT,

                "--pids-limit",
                "64",

                "--read-only",

                "--tmpfs",
                "/tmp:rw,noexec,nosuid,size=32m",

                "--security-opt",
                "no-new-privileges",

                config.image,

                "sh",
                "-c",
                shellCommand,
            ],
            {
                timeout: EXECUTION_TIMEOUT,
                maxBuffer: 256 * 1024,
                windowsHide: true,
            }
        );

        return {
            language: normalizedLanguage,
            output: stdout || "",
            error: stderr || null,
            status: stderr ? "error" : "success",
        };
    } catch (error) {
        if (error.killed || error.code === "ETIMEDOUT") {
            try {
                await execFileAsync(
                    "docker",
                    ["kill", containerName],
                    {
                        timeout: 2_000,
                        windowsHide: true,
                    }
                );
            } catch {
                // Container may already have exited.
            }

            return {
                language: normalizedLanguage,
                output: "",
                error: "Execution timed out. Please check your code for an infinite loop.",
                status: "timeout",
            };
        }

        return {
            language: normalizedLanguage,
            output: error.stdout || "",
            error:
                error.stderr ||
                error.message ||
                "Code execution failed.",
            status: "error",
        };
    }
}
