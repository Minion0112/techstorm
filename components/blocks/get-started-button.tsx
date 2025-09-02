"use client"

import type React from "react"

type Props = {
  href?: string
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}

/**
 * Big, animated "Get Started" button matching a black/red hackathon theme.
 * Colors used (4 total):
 * - Red: #dc2626 (primary)
 * - Deep Red (shadow): #7f1d1d
 * - Black: #0b0b0b
 * - White: #ffffff
 */
export function GetStartedButton({ href, onClick, children = "Get Started", className = "" }: Props) {
  const ButtonCore = (
    <span className={`hack-btn ${className}`} aria-label="Get started">
      <span className="label">{children}</span>
      <svg className="arrow" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12h13m0 0-5-5m5 5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style jsx>{`
        .hack-btn {
          --red: #dc2626;
          --deep-red: #7f1d1d;
          --bg: #0b0b0b;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 22px 34px;
          border-radius: 16px;
          background: var(--bg);
          color: #ffffff;
          border: 2px solid var(--red);
          box-shadow: 0 8px 0 var(--deep-red);
          font-weight: 900;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: 1.25rem; /* text-xl */
          line-height: 1;
          transform: translateZ(0);
          transition: transform 180ms ease, box-shadow 180ms ease,
            border-color 180ms ease, background-color 180ms ease;
          isolation: isolate;
        }

        /* Idle pulse ring */
        .hack-btn::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.38);
          animation: ring 2.25s ease-out infinite;
          pointer-events: none;
          z-index: -1;
        }

        /* Shimmer sweep on hover */
        .hack-btn::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(255, 255, 255, 0.18) 45%,
            rgba(255, 255, 255, 0.18) 55%,
            transparent 100%
          );
          transform: translateX(-135%);
          transition: transform 650ms ease;
          pointer-events: none;
          z-index: 0;
        }

        .label {
          position: relative;
          z-index: 1;
          text-shadow: -2px 2px 0 #000000, 2px 2px 0 rgba(255, 255, 255, 0.9);
        }

        .arrow {
          position: relative;
          z-index: 1;
          transition: transform 200ms ease;
        }

        .hack-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 0 var(--deep-red), 0 0 28px rgba(220, 38, 38, 0.35);
          border-color: #ef4444; /* a bit brighter on hover */
        }

        .hack-btn:hover::before {
          transform: translateX(135%);
        }

        .hack-btn:hover .arrow {
          transform: translateX(6px);
        }

        .hack-btn:active {
          transform: translateY(0px);
          box-shadow: 0 8px 0 var(--deep-red);
        }

        .hack-btn:focus-visible {
          outline: 3px solid #fca5a5; /* visible keyboard focus */
          outline-offset: 3px;
        }

        @keyframes ring {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.38);
          }
          70% {
            box-shadow: 0 0 0 18px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
      `}</style>
    </span>
  )

  if (href) {
    return (
      <a href={href} onClick={onClick} className="inline-block">
        {ButtonCore}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className="inline-block">
      {ButtonCore}
    </button>
  )
}

export default GetStartedButton
