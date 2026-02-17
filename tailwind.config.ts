import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#FF5A1F', // HotPlate Orange
                    hover: '#E64A19',
                    light: '#FF8A65',
                },
                brand: {
                    orange: '#FF5A1F',
                    canvas: '#FDFBF7', // HotPlate Beige
                    black: '#1A1A1A',
                    gray: '#8C8C8C',
                },
                gray: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#EEEEEE',
                    300: '#E0E0E0',
                    800: '#2D2D2D',
                    900: '#1A1A1A',
                }
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2.5rem',
                'pill': '9999px',
            },
            fontFamily: {
                sans: ['var(--font-poppins)', 'sans-serif'],
                serif: ['var(--font-dm-serif)', 'serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0,0,0,0.05)',
                'card': '0 10px 40px -10px rgba(0,0,0,0.08)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
            }
        },
    },
    plugins: [],
};
export default config;
