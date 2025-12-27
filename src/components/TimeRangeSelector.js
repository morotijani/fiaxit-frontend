const ranges = [
    { label: "24H", value: "24h" },
    { label: "1W", value: "1w" },
    { label: "1M", value: "1m" },
    { label: "3M", value: "3m" },
    { label: "1Y", value: "1y" },
    { label: "ALL", value: "all" },
];

export default function TimeRangeSelector({ active, onChange }) {
    return (
        <div className="d-flex justify-content-between bg-white bg-opacity-50 p-1 rounded-pill border shadow-sm mx-2">
            {ranges.map((r) => (
                <button
                    key={r.value}
                    className={`btn btn-sm flex-grow-1 rounded-pill border-0 py-2 fw-bold transition-all ${active === r.value
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover-bg-light"
                        }`}
                    onClick={() => onChange(r.value)}
                    style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}
