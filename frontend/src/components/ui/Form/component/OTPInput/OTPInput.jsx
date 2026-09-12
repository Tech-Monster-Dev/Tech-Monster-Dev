import "./OTPInput.css";

import { useRef } from "react";

function OTPInput({

    length = 6,

    value,

    onChange

}) {

    const inputRefs = useRef([]);

    const handleChange = (e, index) => {

        const input = e.target.value;

        if (!/^\d*$/.test(input)) return;

        const otp = value.split("");

        otp[index] = input.slice(-1);

        onChange(otp.join(""));

        if (input && index < length - 1) {

            inputRefs.current[index + 1]?.focus();

        }

    };

    const handleKeyDown = (e, index) => {

        if (

            e.key === "Backspace" &&

            !value[index] &&

            index > 0

        ) {

            inputRefs.current[index - 1]?.focus();

        }

    };

    const handlePaste = (e) => {

        e.preventDefault();

        const paste = e.clipboardData

            .getData("text")

            .replace(/\D/g, "")
            .slice(0, length);

        onChange(paste);

        inputRefs.current[
            Math.min(paste.length, length - 1)
        ]?.focus();

    };

    return (

        <div className="otp-container">

            {

                [...Array(length)].map((_, index) => (

                    <input

                        key={index}

                        ref={(el) =>

                            inputRefs.current[index] = el

                        }

                        className="otp-input"

                        value={value[index] || ""}

                        maxLength={1}

                        inputMode="numeric"

                        autoComplete="one-time-code"

                        onPaste={handlePaste}

                        onChange={(e) =>

                            handleChange(e, index)

                        }

                        onKeyDown={(e) =>

                            handleKeyDown(e, index)

                        }

                    />

                ))

            }

        </div>

    );

}

export default OTPInput;