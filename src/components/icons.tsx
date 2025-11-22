import * as React from "react"

export type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

export const Logo = ({ size = 24, height, width, className, ...props }: IconProps) => (
    <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 350 350"
        fill="none"
        height={size || height}
        width={size || width}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <title>Crime Alert Logo</title>

        {/* Shield/Khiên cảnh sát - Background */}
        <path
            d="M175 40 L110 75 L110 165 Q110 220 135 260 Q150 285 175 295 Q200 285 215 260 Q240 220 240 165 L240 75 Z"
            fill="currentColor"
            className="text-amber-600 dark:text-amber-500"
        />

        {/* Shield Border */}
        <path
            d="M175 40 L110 75 L110 165 Q110 220 135 260 Q150 285 175 295 Q200 285 215 260 Q240 220 240 165 L240 75 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinejoin="round"
            className="text-amber-700 dark:text-amber-400"
        />

        {/* Star/Ngôi sao ở giữa */}
        <path
            d="M175 140 L180 165 L205 165 L185 180 L190 205 L175 190 L160 205 L165 180 L145 165 L170 165 Z"
            fill="currentColor"
            className="text-white dark:text-gray-900"
        />

        {/* Decorative lines */}
        <path
            d="M110 100 L175 130 L240 100"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-amber-800 dark:text-amber-300 opacity-60"
        />
    </svg>
);