export default function Skeleton({ height = 20, width = "100%", radius = 8 }) {
    return (
        <div
            className="skeleton"
            style={{ height, width, borderRadius: radius }}
        ></div>
    );
}