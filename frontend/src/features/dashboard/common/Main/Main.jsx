import './Main.css';
import { Outlet } from 'react-router-dom';

function Main() {
    return (
        <>
            <main className="dashboard-main">
                {/* DYNAMIC PAGE CONTENT */}
                <div className="dashboard-content-wrapper">
                    <div className="dashboard-content">
                        <Outlet />
                    </div>
                </div>
            </main>
        </>
    )
}
export default Main;