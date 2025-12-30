import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import PartnerRequests from "./PartnerRequests";
import RecentBookings from "./RecentBookings";
import { useNavigate } from "react-router-dom";
import { programService } from "../../services/api";
import { PieChart, Pie, Cell } from 'recharts';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#d0ed57"];
const chartableStats = new Set(["users", "partners", "venues", "bookings", "revenue", "orders"]);

const normalizeProgramsResponse = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];
  const queue = [payload];
  const visited = new WeakSet();
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (visited.has(current)) continue;
    visited.add(current);
    if (Array.isArray(current)) return current;
    Object.values(current).forEach((v) => {
      if (v && (Array.isArray(v) || typeof v === "object")) queue.push(v);
    });
  }
  return [];
};

const isProgramActive = (program) => {
  const status = String(program?.status || "").toLowerCase();
  return !["inactive", "completed", "ended", "archived", "cancelled"].includes(status);
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [stats, setStats] = useState([]);
  const [statsRaw, setStatsRaw] = useState(null);
  const [chartData, setChartData] = useState({
    users: [],
    partners: [],
    venues: [],
    orders: [],
    revenue: []
  });
  const [selectedChart, setSelectedChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePrograms, setActivePrograms] = useState([]);
  const [activeProgramsCount, setActiveProgramsCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // ================== STATS ==================
        const statsRes = await fetch("http://localhost:8080/api/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        setStatsRaw(statsData);

        setStats([
          { label: "Users", value: statsData.users, type: "users" },
          { label: "NGO", value: statsData.partners, type: "partners" },
          { label: "Products Added", value: statsData.venues, type: "venues" },
          { label: "Total Orders", value: statsData.orders, type: "orders" },
          { label: "Total Sale", value: `NPR ${statsData.orderRevenue?.toLocaleString() || 0}`, type: "revenue" }
        ]);

        // ================== CHART DATA ==================
        const chartRes = await fetch("http://localhost:8080/api/chart-data", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const chartJson = await chartRes.json();

        setChartData({
          users: chartJson.users || [],
          partners: chartJson.partners || [],
          venues: chartJson.venues || [],
          orders: chartJson.orders || [],
          revenue: chartJson.sales || []
        });

        // ================== PROGRAMS ==================
        const programRes = await programService.listPrograms();
        const programs = normalizeProgramsResponse(programRes);
        const activeList = programs.filter(isProgramActive);

        setActiveProgramsCount(activeList.length);
        setActivePrograms(activeList.slice(0, 5));

        setStats((prev) => [
          ...prev,
          { label: "Active Programs", value: activeList.length, type: "activePrograms" }
        ]);

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== Pie Chart for Total Orders =====
  const renderOrdersPieChart = () => {
    if (!statsRaw || !statsRaw.orderStatus) return null;

    const data = Object.entries(statsRaw.orderStatus).map(([status, value]) => ({
      name: status,
      value
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // ===== Render Chart =====
  const renderChart = (type) => {
    if (type === "orders") return renderOrdersPieChart(); // <-- use Pie chart for orders

    const data = chartData[type] || [];

    if (type === "users") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area dataKey="users" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (type === "partners") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="partners" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === "venues") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="venues" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === "revenue") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `NPR ${Number(value).toLocaleString()}`} />
            <Line dataKey="revenue" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <main className="dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-row">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            onClick={() => chartableStats.has(s.type) && setSelectedChart(s.type)}
          >
            <div>{s.label}</div>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      {selectedChart && renderChart(selectedChart)}

      {/* ================== ORDER OVERVIEW ================== */}
      {statsRaw && (
        <section className="dashboard-card">
          <h2>Order Overview</h2>
          <p>Total Orders: {statsRaw.orders}</p>
          <p>Total Revenue: NPR {statsRaw.orderRevenue?.toLocaleString()}</p>
          <p>Pending: {statsRaw.orderStatus?.pending ?? 0}</p>
          <p>Processing: {statsRaw.orderStatus?.processing ?? 0}</p>
          <p>Shipped: {statsRaw.orderStatus?.shipped ?? 0}</p>
          <p>Completed: {statsRaw.orderStatus?.completed ?? 0}</p>
          <p>Cancelled: {statsRaw.orderStatus?.cancelled ?? 0}</p>
        </section>
      )}

      <div className="tabs">
        <button onClick={() => setActiveTab("pending")}>Pending Partners</button>
        <button onClick={() => setActiveTab("bookings")}>Recent Bookings</button>
      </div>

      {activeTab === "pending" ? <PartnerRequests /> : <RecentBookings />}
    </main>
  );
};

export default Dashboard;
