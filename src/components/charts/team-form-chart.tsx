"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { label: "D-30", RankingTop1: 72, RankingTop2: 68, RankingTop3: 64 },
  { label: "D-21", RankingTop1: 70, RankingTop2: 69, RankingTop3: 62 },
  { label: "D-14", RankingTop1: 74, RankingTop2: 67, RankingTop3: 65 },
  { label: "D-7", RankingTop1: 76, RankingTop2: 71, RankingTop3: 66 },
  { label: "Hoje", RankingTop1: 78, RankingTop2: 72, RankingTop3: 68 },
];

export function TeamFormChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 4, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="vitality" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="furia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1b2430" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} width={32} domain={[40, 80]} />
          <Tooltip
            contentStyle={{
              background: "#0d1219",
              border: "1px solid #1b2430",
              borderRadius: 8,
              color: "#e7edf5",
            }}
          />
          <Area type="monotone" dataKey="RankingTop1" stroke="#38bdf8" fill="url(#vitality)" strokeWidth={2} />
          <Area type="monotone" dataKey="RankingTop2" stroke="#22c55e" fill="url(#furia)" strokeWidth={2} />
          <Area type="monotone" dataKey="RankingTop3" stroke="#f59e0b" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
