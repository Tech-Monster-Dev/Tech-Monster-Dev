import './Congratulations.css';

export default function Congratulations({courseType, userName}) {
    return (
        <>
            <div className="congrats-banner">

                <h3>
                    Congratulations! 🎉 {userName}
                </h3>

                <p>
                    You have successfully completed{" "}
                    <strong>
                        {courseType}
                    </strong>
                </p>

            </div>
        </>
    )
}