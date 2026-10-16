"use client";

import "./Main.css";

function Main({ children }) {
    return (
        <main className="dashboard-main">
            <div className="dashboard-content-wrapper">
                <div className="dashboard-content">
                    {children}
                </div>
            </div>
        </main>
    );
}

export default Main;
