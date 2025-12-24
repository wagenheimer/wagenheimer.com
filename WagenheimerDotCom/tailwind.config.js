/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{razor,html,cshtml}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Outfit"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                cyber: ['"Orbitron"', 'sans-serif'],
            },
            colors: {
                obsidian: '#02040a',
                surface: '#0f111a',
                card: '#161b27',
                border: 'rgba(255, 255, 255, 0.08)',
                brand: {
                    violet: '#7c3aed', // Primary
                    cyan: '#2dd4bf',   // Secondary
                    orange: '#f97316', // Accent
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s infinite',
                'pop': 'pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                pop: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.15)' },
                    '100%': { transform: 'scale(1.05)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
            }
        }
    },
    plugins: [],
}
