import "./PasswordStrength.css";

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { calculatePasswordStrength } from "../../../../../shared/utils/passwordStrength";

function PasswordStrength({ password }) {

    const {
        score,
        strength,
        rules
    } = calculatePasswordStrength(password);

    return (

        <div className="password-strength">

            <div className="strength-header">

                <span>Password Strength</span>

                <strong className={strength.toLowerCase()}>

                    {strength}

                </strong>

            </div>

            <div className="strength-bar">

                <div

                    className={`strength-fill ${strength.toLowerCase()}`}

                    style={{

                        width: `${(score / 5) * 100}%`

                    }}

                />

            </div>

            <div className="strength-rules">

                {

                    rules.map(rule => (

                        <p

                            key={rule.label}

                            className={rule.valid ? "valid" : "invalid"}

                        >

                            {

                                rule.valid

                                    ?

                                    <FaCheckCircle />

                                    :

                                    <FaTimesCircle />

                            }

                            {rule.label}

                        </p>

                    ))

                }

            </div>

        </div>

    );

}

export default PasswordStrength;