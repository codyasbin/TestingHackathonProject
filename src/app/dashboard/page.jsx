"use client";
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../components/header';

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');


  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role || 'user');
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings`);
      const result = await response.json();
      
      if (result.success) {
        setBookings(result.data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Error fetching bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics based on user role
  const getAnalytics = () => {
    if (bookings.length === 0) return null;

    // Filter bookings based on role
    let filteredBookings = bookings;
    const userId = localStorage.getItem('userId');
    
    if (userRole === 'customer' && userId) {
      filteredBookings = bookings.filter(b => b.customerId === userId);
      // If no bookings match, show all (user might be viewing as admin/general)
      if (filteredBookings.length === 0) {
        filteredBookings = bookings;
      }
    } else if (userRole === 'provider') {
      const providerId = localStorage.getItem('providerId');
      if (providerId) {
        filteredBookings = bookings.filter(b => b.providerId === providerId);
        // If no bookings match, show all
        if (filteredBookings.length === 0) {
          filteredBookings = bookings;
        }
      }
    }
    // For admin or any other role, show all bookings

    // Total revenue
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.total, 0);
    
    // Average booking value
    const avgBookingValue = totalRevenue / filteredBookings.length;

    // Status distribution
    const statusCount = filteredBookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));

    // Service distribution
    const serviceCount = filteredBookings.reduce((acc, b) => {
      acc[b.service] = (acc[b.service] || 0) + 1;
      return acc;
    }, {});

    const serviceData = Object.entries(serviceCount).map(([service, count]) => ({
      service,
      bookings: count
    }));

    // Revenue by service
    const revenueByService = filteredBookings.reduce((acc, b) => {
      acc[b.service] = (acc[b.service] || 0) + b.total;
      return acc;
    }, {});

    const revenueData = Object.entries(revenueByService).map(([service, revenue]) => ({
      service,
      revenue
    }));

    // Payment method distribution
    const paymentCount = filteredBookings.reduce((acc, b) => {
      acc[b.paymentMethod] = (acc[b.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    const paymentData = Object.entries(paymentCount).map(([method, count]) => ({
      name: method.toUpperCase(),
      value: count
    }));

    // Bookings over time
    const bookingsByDate = filteredBookings.reduce((acc, b) => {
      const date = new Date(b.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timeData = Object.entries(bookingsByDate).map(([date, count]) => ({
      date,
      bookings: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Provider performance (for admin)
    const providerStats = filteredBookings.reduce((acc, b) => {
      if (!acc[b.provider]) {
        acc[b.provider] = { bookings: 0, revenue: 0 };
      }
      acc[b.provider].bookings += 1;
      acc[b.provider].revenue += b.total;
      return acc;
    }, {});

    const providerData = Object.entries(providerStats).map(([provider, stats]) => ({
      provider,
      bookings: stats.bookings,
      revenue: stats.revenue
    }));

    return {
      totalBookings: filteredBookings.length,
      totalRevenue,
      avgBookingValue,
      statusData,
      serviceData,
      revenueData,
      paymentData,
      timeData,
      providerData
    };
  };

  const analytics = getAnalytics();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalBookings === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No booking data available yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          {/* <p className="text-gray-600 mt-2">
            Viewing as: <span className="font-semibold capitalize">{userRole}</span>
          </p> */}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Bookings</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalBookings}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">${analytics.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Average Booking Value</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">${analytics.avgBookingValue.toFixed(2)}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings Over Time */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Service Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Service</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.serviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Service */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Provider Performance (for admin role) */}
          {userRole === 'admin' && analytics.providerData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.providerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="provider" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="bookings" fill="#8b5cf6" name="Bookings" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#ec4899" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}