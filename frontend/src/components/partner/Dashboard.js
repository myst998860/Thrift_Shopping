import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import RecentBookings from "./RecentBookings";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState({
    venues: [],
    bookings: []
  });
  const [selectedChart, setSelectedChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      console.error("No JWT token found, user might not be logged in");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsResponse = await fetch("http://localhost:8080/api/stats", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!statsResponse.ok) throw new Error(`HTTP error! status: ${statsResponse.status}`);
        const statsData = await statsResponse.json();
        
        setStats([
          { label: "Venues", value: statsData.venues, type: "venues" },
          { label: "Bookings", value: statsData.bookings, type: "bookings" },
       { label: "Revenue", value: `NPR ${statsData.revenue?.toLocaleString() || 0}`, type: "revenue" },
        ]);

        // Fetch chart data
        const chartResponse = await fetch("http://localhost:8080/api/chart-data", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!chartResponse.ok) throw new Error(`HTTP error! status: ${chartResponse.status}`);
        const chartDataResponse = await chartResponse.json();
        
        setChartData(chartDataResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatClick = (statType) => {
    setSelectedChart(statType);
  };

  const handleCloseChart = () => {
    setSelectedChart(null);
  };

  const renderChart = (type) => {
    const data = chartData[type] || [];
    
    switch (type) {
      case 'venues':
        return (
          <div className="chart-container">
            <h3>Venue Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="venues" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'bookings':
        return (
          <div className="chart-container">
            <h3>Booking & Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="dashboard" style={{ flex: 1 }}>
        <div className="breadcrumb">Partner Dashboard</div>
        <h1>Partner Dashboard</h1>
        <p>Loading dashboard data...</p>
      </main>
    );
  }

  return (
    <main className="dashboard" style={{ flex: 1 }}>
      <div className="breadcrumb">Partner Dashboard</div>
      <h1>Partner Dashboard</h1>
      <p>Manage the entire platform</p>
      
      <div className="stats-row">
        {stats.map((stat) => (
          <div 
            className={`stat-card ${stat.type !== 'revenue' ? 'clickable' : ''}`} 
            key={stat.label}
            onClick={() => stat.type !== 'revenue' && handleStatClick(stat.type)}
            style={{ cursor: stat.type !== 'revenue' ? 'pointer' : 'default' }}
          >
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            {stat.type !== 'revenue' && (
              <div className="stat-hint">Click to view chart</div>
            )}
          </div>
        ))}
      </div>

      {selectedChart && (
        <div className="chart-modal-overlay" onClick={handleCloseChart}>
          <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chart-modal-header">
              <h2>{selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Analytics</h2>
              <button className="chart-close-btn" onClick={handleCloseChart}>×</button>
            </div>
            <div className="chart-modal-body">
              {renderChart(selectedChart)}
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
      
        <button
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          Recent Bookings
        </button>
      </div>
     <RecentBookings />
    </main>
  );
};
export default Dashboard; 