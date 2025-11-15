const ranges = [
    // { label: "1H", value: "1h" },
    { label: "24H", value: "24h" },
    { label: "1W", value: "1w" },
    { label: "1M", value: "1m" },
    { label: "3M", value: "3m" },
    { label: "1Y", value: "1y" },
    { label: "ALL", value: "all" },
];

export default function TimeRangeSelector({ active, onChange }) {
    return (
        <div className="time-range justify-content-center">
            {ranges.map((r) => (
                <button
                    key={r.value}
                    className={`range-btn ${active === r.value ? "active" : ""}`}
                    onClick={() => onChange(r.value)}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}
