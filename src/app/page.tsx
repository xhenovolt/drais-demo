"use client";
import Image from "next/image";
import Banner from "@/components/layout/Banner";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useEffect, useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const DEMO_DATA = {
  total_classes: 10,
  total_learners: 500,
  boys: 300,
  girls: 200,
  total_staff: 50,
  total_parents: 400,
  admissions: {
    today: 5,
    this_year: 120,
  },
  payment_stats: {
    fully_paid: 300,
    partially_paid: 150,
  },
  teacher_payments: {
    paid_teachers: 40,
    unpaid_teachers: 10,
  },
  learner_performance: {
    improving_learners: 50,
    declining_learners: 20,
  },
  best_learner: { name: "John Doe", score: 95 },
  worst_learner: { name: "Jane Smith", score: 35 },
  bar: {
    labels: ["Class 1", "Class 2", "Class 3"],
    values: [50, 70, 80],
  },
  pie: {
    labels: ["Boys", "Girls"],
    values: [300, 200],
  },
  line: {
    labels: ["Week 1", "Week 2", "Week 3"],
    values: [20, 40, 60],
  },
  incomeStatement: {
    revenue: 50000,
    expenses: 30000,
    profit: 20000,
  },
  balanceSheet: {
    assets: 100000,
    liabilities: 80000,
    equity: 20000,
  },
  studentResults: [
    { name: "John Doe", score: 95 },
    { name: "Jane Smith", score: 35 },
    { name: "Alice Johnson", score: 80 },
  ],
  term_progress: {
    term_name: "Demo Term",
    remaining_days: 30,
    days_covered: 60,
    weekends_covered: 8,
    public_days: 2,
  },
};

export default function HomePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();
        setData(result.data && Object.keys(result.data).length > 0 ? result.data : DEMO_DATA);
      } catch {
        setData(DEMO_DATA);
      }
    }
    fetchData();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const termProgress = data.term_progress || {
    term_name: "No Active Term",
    remaining_days: 0,
    days_covered: 0,
    weekends_covered: 0,
    public_days: 0,
  };

  const barData = {
    labels: data.bar.labels,
    datasets: [
      {
        label: "Total",
        data: data.bar.values,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: data.pie.labels,
    datasets: [
      {
        data: data.pie.values,
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  const lineData = {
    labels: data.line.labels,
    datasets: [
      {
        label: "Trend",
        data: data.line.values,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="space-y-8 pb-24">
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-300">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Total Classes</h2>
              <p className="text-2xl font-bold">{data.total_classes}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Total Learners</h2>
              <p className="text-2xl font-bold">{data.total_learners}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Boys</h2>
              <p className="text-2xl font-bold">{data.boys}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Girls</h2>
              <p className="text-2xl font-bold">{data.girls}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Total Staff</h2>
              <p className="text-2xl font-bold">{data.total_staff}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Total Parents</h2>
              <p className="text-2xl font-bold">{data.total_parents}</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">System Analysis</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Bar Chart</h2>
              <Bar data={barData} />
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Pie Chart</h2>
              <Pie data={pieData} />
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Line Chart</h2>
              <Line data={lineData} />
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">Additional Metrics</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Fully Paid Learners</h2>
              <p className="text-2xl font-bold">{data.payment_stats.fully_paid}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Partially Paid Learners</h2>
              <p className="text-2xl font-bold">{data.payment_stats.partially_paid}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Improving Learners</h2>
              <p className="text-2xl font-bold">{data.learner_performance.improving_learners}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Declining Learners</h2>
              <p className="text-2xl font-bold">{data.learner_performance.declining_learners}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">Term Progress</h2>
              <p className="text-sm">Term Name: {termProgress.term_name}</p>
              <p className="text-sm">Remaining Days: {termProgress.remaining_days}</p>
              <p className="text-sm">Days Covered: {termProgress.days_covered}</p>
              <p className="text-sm">Weekends Covered: {termProgress.weekends_covered}</p>
              <p className="text-sm">Public Days: {termProgress.public_days}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}