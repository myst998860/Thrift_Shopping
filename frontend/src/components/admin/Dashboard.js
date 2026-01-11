import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import PartnerRequests from "./PartnerRequests";
import RecentBookings from "./RecentBookings";
import { useNavigate } from "react-router-dom";
import { programService, orderAPI, donationAPI } from "../../services/api";
import { PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const COLORS = ["#ef4444", "#3b82f6", "#fbbf24", "#10b981", "#8b5cf6", "#f97316"];
const chartableStats = new Set(["users", "partners", "venues", "orders", "revenue", "pickupRevenue"]);

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
  const [activeTab, setActiveTab] = useState("pending"); // Default to pending partners
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
  const [orderActivity, setOrderActivity] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [orderStats, setOrderStats] = useState({
    shipped: 0,
    processing: 0,
    completed: 0,
    pending: 0,
    cancelled: 0
  });
  const [pickupStats, setPickupStats] = useState({ totalRevenue: 0, chartData: [] });
  const [feeSummary, setFeeSummary] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
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

        // ================== ORDER ACTIVITY ==================
        try {
          const orders = await orderAPI.listOrders();
          // Sort by date and get recent orders
          const sortedOrders = orders
            .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
            .slice(0, 5);
          setOrderActivity(sortedOrders);

          // Calculate order status statistics
          const statusCounts = {
            shipped: 0,
            processing: 0,
            completed: 0,
            pending: 0,
            cancelled: 0
          };

          orders.forEach(order => {
            const status = (order.status || '').toLowerCase();
            if (status.includes('ship')) statusCounts.shipped++;
            else if (status.includes('process')) statusCounts.processing++;
            else if (status.includes('complete')) statusCounts.completed++;
            else if (status.includes('pending')) statusCounts.pending++;
            else if (status.includes('cancel')) statusCounts.cancelled++;
          });

          setOrderStats(statusCounts);
        } catch (err) {
          console.error("Failed to fetch order activity:", err);
        }

        // ================== PICKUP DONATIONS REVENUE ==================
        try {
          const donations = await donationAPI.listDonations();
          const totalPickupRevenue = donations.reduce((sum, d) => sum + (d.pickupFee || 0), 0);

          // Group by month
          const revenueByMonth = {};
          donations.forEach(d => {
            if (d.pickupFee > 0 && d.createdAt) {
              const date = new Date(d.createdAt);
              const month = date.toLocaleString('default', { month: 'short' });
              revenueByMonth[month] = (revenueByMonth[month] || 0) + d.pickupFee;
            }
          });

          const donationChartData = Object.entries(revenueByMonth).map(([month, amount]) => ({
            month,
            revenue: amount
          }));

          setPickupStats({ totalRevenue: totalPickupRevenue, chartData: donationChartData });
        } catch (err) {
          console.error("Failed to fetch donations for stats:", err);
        }

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchFeeSummary();

    // Check for tab parameter in URL
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ["pending", "bookings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const fetchFeeSummary = async () => {
    try {
      const summary = await donationAPI.getAdminFeeSummary();
      setFeeSummary(summary);
    } catch (err) {
      console.error("Failed to fetch fee summary:", err);
    }
  };

  const handleRequestPayment = async (partnerId) => {
    try {
      setActionLoading(true);
      await donationAPI.requestPayment(partnerId);
      alert("Payment request sent to partner!");
      fetchFeeSummary();
    } catch (err) {
      alert("Failed to request payment: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettlePayment = async (partnerId, action) => {
    try {
      setActionLoading(true);
      await donationAPI.settlePayment(partnerId, action);
      alert(`Payment ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      fetchFeeSummary();
    } catch (err) {
      alert("Failed to settle payment: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ===== Render Chart for Specific Type =====
  const renderChartForType = (type) => {
    const data = chartData[type] || [];

    if (data.length === 0) {
      return (
        <div className="no-chart-data">
          <p>No data available for {type} chart</p>
        </div>
      );
    }

    switch (type) {
      case "users":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                fill="url(#colorUsers)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );

      case "partners":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip />
              <Bar
                dataKey="partners"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "venues":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="venues"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "orders":
        return renderOrdersPieChart();

      case "revenue":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis
                tickFormatter={(value) => `NPR ${value.toLocaleString()}`}
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip
                formatter={(value) => [`NPR ${Number(value).toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#06b6d4"
                fill="url(#colorRevenue)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pickupRevenue":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pickupStats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`NPR ${value}`, 'Fees']} />
              <Bar dataKey="revenue" fill="#ff9800" name="Pickup Revenue" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="no-chart-data">
            <p>Chart type not supported: {type}</p>
          </div>
        );
    }
  };

  // ===== Pie Chart for Total Orders =====
  const renderOrdersPieChart = () => {
    if (!statsRaw || !statsRaw.orderStatus) return null;

    const data = Object.entries(statsRaw.orderStatus)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value
      }));

    if (data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="orders-pie-chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="order-status-list">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(0);
            return (
              <div key={item.name} className="status-item">
                <div className="status-header">
                  <span className="status-name">{item.name}</span>
                  <span className="status-percentage">{percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== Total Sale Graph =====
  const renderTotalSaleGraph = () => {
    const data = chartData.revenue || [];

    if (data.length === 0) {
      return (
        <div className="no-data-message">
          <p>No sales data available</p>
        </div>
      );
    }

    return (
      <div className="total-sale-graph">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              tickFormatter={(value) => `NPR ${value.toLocaleString()}`}
              tick={{ fill: '#666', fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip
              formatter={(value) => [`NPR ${Number(value).toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              fill="url(#colorRevenue)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // ===== Order Status Statistics =====
  const renderOrderStatusStats = () => {
    const statusConfig = {
      shipped: {
        label: "Shipped",
        color: "#3b82f6",
        bgColor: "#dbeafe",
        icon: "🚚"
      },
      processing: {
        label: "Processing",
        color: "#f59e0b",
        bgColor: "#fef3c7",
        icon: "⏳"
      },
      completed: {
        label: "Completed",
        color: "#10b981",
        bgColor: "#d1fae5",
        icon: "✅"
      },
      pending: {
        label: "Pending",
        color: "#f97316",
        bgColor: "#ffedd5",
        icon: "⏱️"
      },
      cancelled: {
        label: "Cancelled",
        color: "#ef4444",
        bgColor: "#fee2e2",
        icon: "❌"
      }
    };

    return (
      <div className="order-stats-container">
        <h3 className="order-stats-title">Order Status Breakdown</h3>
        <div className="order-stats-grid">
          {Object.entries(orderStats).map(([key, count]) => (
            <div key={key} className="order-stat-card" style={{ borderColor: statusConfig[key].color }}>
              <div className="order-stat-icon" style={{ backgroundColor: statusConfig[key].bgColor }}>
                <span>{statusConfig[key].icon}</span>
              </div>
              <div className="order-stat-content">
                <div className="order-stat-value" style={{ color: statusConfig[key].color }}>
                  {count}
                </div>
                <div className="order-stat-label">{statusConfig[key].label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;

  const metricCards = [
    {
      label: "Users",
      value: statsRaw?.users || 0,
      type: "users",
      icon: "👥",
      color: "#d1fae5",
      borderColor: "#10b981"
    },
    {
      label: "NGO",
      value: statsRaw?.partners || 0,
      type: "partners",
      icon: "🏢",
      color: "#dbeafe",
      borderColor: "#3b82f6"
    },
    {
      label: "Products Added",
      value: statsRaw?.venues || 0,
      type: "venues",
      icon: "📦",
      color: "#e9d5ff",
      borderColor: "#8b5cf6"
    },
    {
      label: "Total Orders",
      value: statsRaw?.orders || 0,
      type: "orders",
      icon: "🛒",
      color: "#fce7f3",
      borderColor: "#ec4899"
    },
    {
      label: "Total Sale",
      value: `NPR ${(statsRaw?.orderRevenue || 0).toLocaleString()}`,
      type: "revenue",
      icon: "💰",
      color: "#cffafe",
      borderColor: "#06b6d4"
    },
    {
      label: "Active Programs",
      value: activeProgramsCount,
      type: "activePrograms",
      icon: "📋",
      color: "#fef3c7",
      borderColor: "#f59e0b"
    },
    {
      label: "Pickup Fees",
      value: `NPR ${pickupStats.totalRevenue.toLocaleString()}`,
      type: "pickupRevenue",
      icon: "🚛",
      color: "#ffedd5",
      borderColor: "#ff9800"
    }
  ];

  return (
    <main className="modern-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`metric-card ${expandedCard === card.type ? 'expanded' : ''}`}
            style={{
              borderLeft: `4px solid ${card.borderColor}`,
              backgroundColor: card.color
            }}
            onClick={() => {
              if (chartableStats.has(card.type)) {
                setExpandedCard(expandedCard === card.type ? null : card.type);
                setSelectedChart(expandedCard === card.type ? null : card.type);
              }
            }}
          >
            <div className="metric-icon" style={{ backgroundColor: card.borderColor }}>
              <span>{card.icon}</span>
            </div>
            <div className="metric-content">
              <div className="metric-value">{card.value}</div>
              <div className="metric-label">{card.label}</div>
            </div>
            <button className="view-all-btn" onClick={(e) => {
              e.stopPropagation();
              // Navigate to relevant page
            }}>
              View All →
            </button>
            {expandedCard === card.type && chartableStats.has(card.type) && (
              <div className="metric-chart-expanded">
                {renderChartForType(card.type)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Total Sale Graph Section */}
        <div className="dashboard-section total-sale-section">
          <h2 className="section-title">
            <span className="section-title-icon">📈</span>
            Total Sales Overview
          </h2>
          {renderTotalSaleGraph()}
        </div>

        {/* Orders by Status Section */}
        <div className="dashboard-section orders-status-section">
          <h2 className="section-title">
            <span className="section-title-icon">📊</span>
            Orders by Status
          </h2>
          {renderOrdersPieChart()}
        </div>
      </div>

      {/* Order Status Statistics */}
      <div className="dashboard-section order-stats-section">
        <h2 className="section-title">
          <span className="section-title-icon">📋</span>
          Order Status Breakdown
        </h2>
        {renderOrderStatusStats()}
      </div>

      {/* Tabs Section */}
      <div className="dashboard-tabs-section">
        <div className="tabs">
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending Partners
          </button>
          <button
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => setActiveTab("bookings")}
          >
            Recent Bookings
          </button>
        </div>
        {activeTab === "pending" && <PartnerRequests />}
        {activeTab === "bookings" && <RecentBookings />}
      </div>
    </main>
  );
};

export default Dashboard;
