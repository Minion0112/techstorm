'use client';

import React from "react";
import { motion } from "framer-motion";
import { Users, Code, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HackathonShowcaseProps {
  className?: string;
  circleText?: string;
  stageTexts?: {
    idea: string;
    build: string;
    pitch: string;
    win: string;
  };
  badgeTexts?: {
    team: string;
    tech: string;
  };
  title?: string;
  lightColor?: string;
}

const HackathonShowcase = ({
  className,
  circleText,
  stageTexts,
  badgeTexts,
  title,
  lightColor,
}: HackathonShowcaseProps) => {
  return (
    <div
      className={cn(
        "relative flex h-[350px] w-full max-w-[500px] flex-col items-center",
        className
      )}
    >
      {/* SVG Paths  */}
      <svg
        className="h-full sm:w-full text-muted"
        width="100%"
        height="100%"
        viewBox="0 0 200 100"
      >
        <g
          stroke="currentColor"
          fill="none"
          strokeWidth="0.4"
          strokeDasharray="100 100"
          pathLength="100"
        >
          <path d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" />
          <path d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" />
          <path d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" />
          <path d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" />
          {/* Animation For Path Starting */}
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        </g>
        {/* Lights */}
        <g mask="url(#db-mask-1)">
          <circle
            className="database db-light-1"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-gold-grad)"
          />
        </g>
        <g mask="url(#db-mask-2)">
          <circle
            className="database db-light-2"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-gold-grad)"
          />
        </g>
        <g mask="url(#db-mask-3)">
          <circle
            className="database db-light-3"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-gold-grad)"
          />
        </g>
        <g mask="url(#db-mask-4)">
          <circle
            className="database db-light-4"
            cx="0"
            cy="0"
            r="12"
            fill="url(#db-gold-grad)"
          />
        </g>
        {/* Buttons */}
        <g stroke="currentColor" fill="none" strokeWidth="0.4">
          {/* Idea Button */}
          <g>
            <rect
              fill="#18181B"
              x="14"
              y="5"
              width="34"
              height="10"
              rx="5"
            ></rect>
            <IdeaIcon x="18" y="7.5"></IdeaIcon>
            <text
              x="28"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {stageTexts?.idea || "Idea"}
            </text>
          </g>
          {/* Build Button */}
          <g>
            <rect
              fill="#18181B"
              x="60"
              y="5"
              width="34"
              height="10"
              rx="5"
            ></rect>
            <BuildIcon x="64" y="7.5"></BuildIcon>
            <text
              x="74"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {stageTexts?.build || "Build"}
            </text>
          </g>
          {/* Pitch Button */}
          <g>
            <rect
              fill="#18181B"
              x="108"
              y="5"
              width="34"
              height="10"
              rx="5"
            ></rect>
            <PitchIcon x="112" y="7.5"></PitchIcon>
            <text
              x="122"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {stageTexts?.pitch || "Pitch"}
            </text>
          </g>
          {/* Win Button */}
          <g>
            <rect
              fill="#18181B"
              x="150"
              y="5"
              width="40"
              height="10"
              rx="5"
            ></rect>
            <WinIcon x="154" y="7.5"></WinIcon>
            <text
              x="165"
              y="12"
              fill="white"
              stroke="none"
              fontSize="5"
              fontWeight="500"
            >
              {stageTexts?.win || "Win"}
            </text>
          </g>
        </g>
        <defs>
          <mask id="db-mask-1">
            <path
              d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <mask id="db-mask-2">
            <path
              d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <mask id="db-mask-3">
            <path
              d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <mask id="db-mask-4">
            <path
              d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <radialGradient id="db-gold-grad" fx="1">
            <stop offset="0%" stopColor={lightColor || "#FFD700"} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
      {/* Main Box */}
      <div className="absolute bottom-10 flex w-full flex-col items-center">
        {/* bottom shadow */}
        <div className="absolute -bottom-4 h-[100px] w-[62%] rounded-lg bg-accent/30" />
        {/* box title */}
        <div className="absolute -top-3 z-20 flex items-center justify-center rounded-lg border bg-[#101112] px-2 py-1 sm:-top-4 sm:py-1.5">
          <SparklesIcon className="size-3" />
          <span className="ml-2 text-[10px]">
            {title ? title : "Hackathon Project Showcase"}
          </span>
        </div>
        {/* box outter circle */}
        <div className="absolute -bottom-8 z-30 grid h-[60px] w-[60px] place-items-center rounded-full border-t bg-[#141516] font-semibold text-xs">
          {circleText ? circleText : <TrophyIcon />}
        </div>
        {/* box content */}
        <div className="relative z-10 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background shadow-md">
          {/* Badges */}
          <div className="absolute bottom-8 left-12 z-10 h-7 rounded-full bg-[#101112] px-3 text-xs border flex items-center gap-2 ">
            <Users className="size-4" />
            <span>{badgeTexts?.team || "The A-Team"}</span>
          </div>
          <div className="absolute right-16 z-10 hidden h-7 rounded-full bg-[#101112] px-3 text-xs sm:flex border items-center gap-2">
            <Code className="size-4" />
            <span>{badgeTexts?.tech || "Next.js"}</span>
          </div>
          {/* Circles */}
          <motion.div
            className="absolute -bottom-14 h-[100px] w-[100px] rounded-full border-t bg-accent/5"
            animate={{
              scale: [0.98, 1.02, 0.98, 1, 1, 1, 1, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 h-[145px] w-[145px] rounded-full border-t bg-accent/5"
            animate={{
              scale: [1, 1, 1, 0.98, 1.02, 0.98, 1, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-[100px] h-[190px] w-[190px] rounded-full border-t bg-accent/5"
            animate={{
              scale: [1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-[120px] h-[235px] w-[235px] rounded-full border-t bg-accent/5"
            animate={{
              scale: [1, 1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};

export default HackathonShowcase;

const IdeaIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => (
  <svg x={x} y={y} width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-7 7c0 3.07 1.667 4.667 4 6h6c2.333-1.333 4-2.93 4-6a7 7 0 0 0-7-7Z" />
  </svg>
);

const BuildIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => (
    <svg x={x} y={y} width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 12-8.373 8.373a1 1 0 1 1-1.414-1.414L13.586 10.5" /><path d="m18 9-1.414-1.414A2 2 0 0 0 15.172 7H14a2 2 0 0 0-2 2v1.172a2 2 0 0 0 .586 1.414L14 13" />
    </svg>
);

const PitchIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => (
    <svg x={x} y={y} width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v3" />
    </svg>
);

const WinIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => (
    <svg x={x} y={y} width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const TrophyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);
