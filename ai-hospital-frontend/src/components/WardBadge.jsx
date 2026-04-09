import React from "react";

export default function WardBadge({ ward }) {
  // Mapping wards to valid standard tailwind colors 
  const colors = {
    Emergency: "bg-red-500",
    General: "bg-yellow-500",
    "Mental Health": "bg-purple-500"
  };

  const badgeColor = colors[ward] || "bg-gray-500";

  return (
    <span className={`text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm ${badgeColor}`}>
      {ward}
    </span>
  );
}
