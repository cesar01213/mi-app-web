import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 512,
    height: 512,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 240,
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '24%',
                    border: '12px solid #4f46e5',
                    fontFamily: 'sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                }}
            >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#818cf8', marginRight: -40 }}>T</span>
                    <span style={{ color: '#4ade80' }}>P</span>
                </div>
                <div style={{ fontSize: 32, marginTop: 10, color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                    PRO
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
