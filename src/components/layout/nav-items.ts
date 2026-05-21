import {
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Crosshair,
  Shield,
  Users,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/teams", label: "Times", icon: Shield },
  { href: "/players", label: "Jogadores", icon: Users },
  { href: "/matches", label: "Partidas", icon: CalendarDays },
  { href: "/intelligence", label: "Inteligencia", icon: BrainCircuit },
] as const;

export const productAreas = [
  { label: "CS2 Pro Data", icon: Crosshair },
  { label: "Rankings", icon: BarChart3 },
];
