
import React from "react";

export default function ProgressLine({ points, level, progress }) {
  return (
    <div className="mb-10">
      <div className="flex justify-between text-sm text-purple-300 mb-2">
        <span>Level {level}</span>
        <span>{Math.min(progress, 100).toFixed(1)}%</span>
      </div>
      <div className="w-full h-4 bg-[#1b1b2f] rounded-full overflow-hidden border border-purple-600/40">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 shadow-[0_0_10px_#a855f7] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-400 text-xs mt-2 text-center">
        {points} / 1000 points to reach the next level
      </p>
    </div>
  );
}
