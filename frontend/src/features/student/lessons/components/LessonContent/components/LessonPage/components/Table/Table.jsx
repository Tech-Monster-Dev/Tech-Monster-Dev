import "./Table.css";

export default function Table({ data }) {
    if (
        !data ||
        !Array.isArray(data.rows) ||
        data.rows.length === 0
    ) {
        return null;
    }

    const headers = Array.isArray(data.headers)
        ? data.headers
        : [];

    return (
        <section className="lesson-table-block">
            {data.title ? (
                <div className="lesson-table-block__header">
                    <h4 className="lesson-table-title">
                        {data.title}
                    </h4>
                </div>
            ) : null}

            <div
                className="lesson-table-scroll"
                role="region"
                aria-label={data.title || "Lesson table"}
                tabIndex="0"
            >
                <table className="lesson-table">
                    {headers.length > 0 ? (
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th
                                        key={`${String(header)}-${index}`}
                                        scope="col"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    ) : null}

                    <tbody>
                        {data.rows.map((row, rowIndex) => {
                            const cells = Array.isArray(row)
                                ? row
                                : [row];

                            return (
                                <tr key={`row-${rowIndex}`}>
                                    {cells.map((cell, cellIndex) => (
                                        <td
                                            key={`${rowIndex}-${cellIndex}`}
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
