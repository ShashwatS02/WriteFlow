"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

// Custom Tooltip Component
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-sm text-gray-600 dark:text-gray-300"
            style={{ color: entry.color }}
          >
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ====================
// Line Chart Component
// ====================

interface LineChartData {
  name: string;
  value: number;
}

interface LineChartCardProps {
  title: string;
  data: LineChartData[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  description?: string;
}

export function LineChartCard({
  title,
  data,
  dataKey = "value",
  xAxisKey = "name",
  color = "#6366f1",
  description,
}: LineChartCardProps) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-slate-700"
            />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ====================
// Area Chart Component
// ====================

interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

interface AreaChartCardProps {
  title: string;
  data: AreaChartData[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey?: string;
  description?: string;
}

export function AreaChartCard({
  title,
  data,
  dataKeys,
  xAxisKey = "name",
  description,
}: AreaChartCardProps) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((item, index) => (
                <linearGradient
                  key={item.key}
                  id={`color${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-slate-700"
            />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((item, index) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color${index})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ====================
// Bar Chart Component
// ====================

interface BarChartData {
  name: string;
  value: number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartData[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  description?: string;
}

export function BarChartCard({
  title,
  data,
  dataKey = "value",
  xAxisKey = "name",
  color = "#10b981",
  description,
}: BarChartCardProps) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-slate-700"
            />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ====================
// Pie Chart Component
// ====================

interface PieChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

interface PieChartCardProps {
  title: string;
  data: PieChartData[];
  description?: string;
}

const COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#06b6d4", // Cyan
];

export function PieChartCard({ title, data, description }: PieChartCardProps) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => {
                const percent = entry.percent || 0;
                return `${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ====================
// Multiple Line Chart
// ====================

interface MultiLineData {
  name: string;
  [key: string]: string | number;
}

interface MultiLineChartCardProps {
  title: string;
  data: MultiLineData[];
  lines: { key: string; color: string; name: string }[];
  xAxisKey?: string;
  description?: string;
}

export function MultiLineChartCard({
  title,
  data,
  lines,
  xAxisKey = "name",
  description,
}: MultiLineChartCardProps) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-slate-700"
            />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis
              className="text-xs"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
