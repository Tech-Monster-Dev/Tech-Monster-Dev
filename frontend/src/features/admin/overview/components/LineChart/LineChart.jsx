import "./LineChart.css";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from "recharts";

export default function LineChart({ chartData = [] }) {

    return (
        <div className="adminChart">
            <div className="adminChartHeader">
                <h2>Weekly Attendance</h2>
            </div>

            <ResponsiveContainer
                width="100%"
                height={350}
            >
                <AreaChart
                    data={chartData}
                >
                    <defs>
                        <linearGradient
                            id="presentAttendance"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#00e676"
                                stopOpacity={0.8}
                            />

                            <stop
                                offset="95%"
                                stopColor="#00e676"
                                stopOpacity={0}
                            />
                        </linearGradient>

                        <linearGradient
                            id="absentAttendance"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#ff5252"
                                stopOpacity={0.8}
                            />

                            <stop
                                offset="95%"
                                stopColor="#ff5252"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        stroke="#2b2b3f"
                    />

                    <XAxis
                        dataKey="day"
                        stroke="#cfcfcf"
                    />

                    <YAxis
                        stroke="#cfcfcf"
                        allowDecimals={false}
                    />

                    <Tooltip />

                    <Legend />

                    <Area
                        type="monotone"
                        dataKey="present"
                        name="Present"
                        stroke="#00e676"
                        strokeWidth={3}
                        fill="url(#presentAttendance)"
                    />

                    <Area
                        type="monotone"
                        dataKey="absent"
                        name="Absent"
                        stroke="#ff5252"
                        strokeWidth={3}
                        fill="url(#absentAttendance)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
