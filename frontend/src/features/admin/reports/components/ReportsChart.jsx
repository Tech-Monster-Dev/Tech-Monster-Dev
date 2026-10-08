import { useMemo } from "react";

const ReportsChart = ({
    data = [],
    valueKey = "present",
    labelKey = "date",
    emptyMessage = "No analytics data available",
}) => {
    const chart = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        const values = data.map((item) => Number(item?.[valueKey]) || 0);
        const maxValue = Math.max(...values, 1);

        const width = 1000;
        const height = 360;
        const paddingX = 56;
        const paddingY = 32;
        const chartWidth = width - paddingX * 2;
        const chartHeight = height - paddingY * 2;

        const points = data.map((item, index) => {
            const x =
                data.length === 1
                    ? width / 2
                    : paddingX +
                      (index / (data.length - 1)) * chartWidth;

            const value = Number(item?.[valueKey]) || 0;

            const y =
                paddingY +
                chartHeight -
                (value / maxValue) * chartHeight;

            return {
                x,
                y,
                value,
                label: item?.[labelKey] ?? "",
            };
        });

        const linePath = points
            .map((point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
            )
            .join(" ");

        const areaPath = [
            `M ${points[0].x} ${height - paddingY}`,
            ...points.map(
                (point) => `L ${point.x} ${point.y}`
            ),
            `L ${points[points.length - 1].x} ${height - paddingY}`,
            "Z",
        ].join(" ");

        return {
            width,
            height,
            paddingX,
            paddingY,
            chartHeight,
            points,
            linePath,
            areaPath,
        };
    }, [data, labelKey, valueKey]);

    if (!chart) {
        return (
            <div className="reports-chart-empty">
                <span>{emptyMessage}</span>
            </div>
        );
    }

    return (
        <div className="reports-chart" role="img" aria-label="Analytics chart">
            <div className="reports-chart-scroll">
                <svg
                    className="reports-chart-svg"
                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                    preserveAspectRatio="none"
                >
                    <line
                        className="reports-chart-axis"
                        x1={chart.paddingX}
                        y1={chart.paddingY}
                        x2={chart.paddingX}
                        y2={chart.height - chart.paddingY}
                    />

                    <line
                        className="reports-chart-axis"
                        x1={chart.paddingX}
                        y1={chart.height - chart.paddingY}
                        x2={chart.width - chart.paddingX}
                        y2={chart.height - chart.paddingY}
                    />

                    <path
                        className="reports-chart-area"
                        d={chart.areaPath}
                    />

                    <path
                        className="reports-chart-line"
                        d={chart.linePath}
                    />

                    {chart.points.map((point, index) => (
                        <g
                            className="reports-chart-point-group"
                            key={`${point.label}-${index}`}
                        >
                            <circle
                                className="reports-chart-point"
                                cx={point.x}
                                cy={point.y}
                                r="5"
                            />

                            <text
                                className="reports-chart-value"
                                x={point.x}
                                y={Math.max(point.y - 14, 18)}
                                textAnchor="middle"
                            >
                                {point.value}
                            </text>

                            <text
                                className="reports-chart-label"
                                x={point.x}
                                y={chart.height - 10}
                                textAnchor="middle"
                            >
                                {point.label}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default ReportsChart;