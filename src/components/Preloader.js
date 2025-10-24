export default function Preloader() {
    // simple centered SVG spinner
    const wrapStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        background: 'var(--bg, #fff)'
    };
    return (
        <div style={wrapStyle} aria-live="polite" aria-busy="true">
            <svg
                width="64"
                height="64"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path fill="none" stroke="currentColor" strokeWidth="4" d="M25 5 A20 20 0 0 1 45 25" strokeLinecap="round">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>
    );
}