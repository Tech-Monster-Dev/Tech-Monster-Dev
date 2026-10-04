import "./AttendanceSummary.css";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const COLORS = [
    "#00e676",
    "#ff5252"
];

export default function AttendanceSummary({
    attendanceSummary
}) {
    const data = [
        {
            name: "Present",
            value: attendanceSummary.present
        },
        {
            name: "Absent",
            value: attendanceSummary.absent
        },
    ];

    return (
        <div className="attendanceSummary">
            <h2>
                Attendance Summary
            </h2>

            <ResponsiveContainer
                width="100%"
                height={280}
            >
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        animationDuration={1200}
                    >
                        {
                            data.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index]}
                                />
                            ))
                        }
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>

            <div className="attendanceLegend">
                <p>
                    🟢 Present :
                    {attendanceSummary.present}
                </p>

                <p>
                    🔴 Absent :
                    {attendanceSummary.absent}
                </p>

            </div>
        </div>
    );
}