"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { map: "Nuke", ct: 58, tr: 49 },
  { map: "Mirage", ct: 53, tr: 55 },
  { map: "Inferno", ct: 56, tr: 47 },
  { map: "Ancient", ct: 61, tr: 44 },
  { map: "Anubis", ct: 48, tr: 57 },
];

export function MapWinrateChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="#1b2430" vertical={false} />
          <XAxis dataKey="map" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} width={32} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            contentStyle={{
              background: "#0d1219",
              border: "1px solid #1b2430",
              borderRadius: 8,
              color: "#e7edf5",
            }}
          />
          <Bar dataKey="ct" name="CT%" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="tr" name="TR%" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
