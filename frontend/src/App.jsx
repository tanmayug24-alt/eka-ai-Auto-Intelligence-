// ============================================================================
// EKA-AI v7.0 COMPLETE FRONTEND APPLICATION
// Single Comprehensive React Application with All BRD/TDD Requirements
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Menu, X, LogOut, Home, FileText, Wrench, CreditCard,
  MessageSquare, Settings, Users, TrendingUp, Plus, Edit2,
  Trash2, Download, Check, Clock, AlertCircle, Eye, ChevronRight,
  Filter, Search
} from 'lucide-react';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
const STAGING_API_URL = process.env.REACT_APP_STAGING_API_URL || 'http://staging-api.eka-ai.com/api/v1';

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add token to requests
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth Endpoints
  async login(email, password) {
    return this.client.post('/auth/login', { email, password });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.client.post('/auth/refresh', { refresh_token: refreshToken });
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  // Vehicles Endpoints
  async getVehicles(tenantId) {
    return this.client.get('/vehicles', { params: { tenant_id: tenantId } });
  }

  async getVehicle(id) {
    return this.client.get(`/vehicles/${id}`);
  }

  async createVehicle(data) {
    return this.client.post('/vehicles', data);
  }

  async updateVehicle(id, data) {
    return this.client.put(`/vehicles/${id}`, data);
  }

  async deleteVehicle(id) {
    return this.client.delete(`/vehicles/${id}`);
  }

  // Job Cards Endpoints
  async getJobCards(tenantId) {
    return this.client.get('/job-cards', { params: { tenant_id: tenantId } });
  }

  async getJobCard(id) {
    return this.client.get(`/job-cards/${id}`);
  }

  async createJobCard(data) {
    return this.client.post('/job-cards', data);
  }

  async transitionJobCard(id, newState) {
    return this.client.patch(`/job-cards/${id}/transition`, { new_state: newState });
  }

  async createEstimate(jobId, data) {
    return this.client.post(`/job-cards/${jobId}/estimate`, data);
  }

  async approveEstimate(jobId, estimateId) {
    return this.client.post(`/job-cards/${jobId}/approve`, { estimate_id: estimateId });
  }

  // Invoices Endpoints
  async getInvoices(tenantId) {
    return this.client.get('/invoices', { params: { tenant_id: tenantId } });
  }

  async getInvoice(id) {
    return this.client.get(`/invoices/${id}`);
  }

  async generateInvoice(jobId) {
    return this.client.post('/invoices/generate', { job_id: jobId });
  }

  async downloadInvoicePDF(id) {
    return this.client.get(`/invoices/${id}/download`, { responseType: 'blob' });
  }

  // MG Engine Endpoints
  async calculateMG(data) {
    return this.client.post('/mg-engine/calculate', data);
  }

  async getMGFormulas() {
    return this.client.get('/mg-engine/formulas');
  }

  // Chat Endpoints
  async sendChatQuery(query, vehicleContext) {
    return this.client.post('/chat/query', { query, vehicle_context: vehicleContext });
  }

  async getChatMessages(jobCardId) {
    return this.client.get(`/chat/messages/${jobCardId}`);
  }

  // Dashboard Endpoints
  async getDashboardKPIs(tenantId) {
    return this.client.get('/dashboard/kpis', { params: { tenant_id: tenantId } });
  }

  async getAnalyticsRevenue(tenantId, period = 'month') {
    return this.client.get('/analytics/revenue', { params: { tenant_id: tenantId, period } });
  }

  async getAnalyticsUsage(tenantId) {
    return this.client.get('/analytics/usage', { params: { tenant_id: tenantId } });
  }

  // Approvals Endpoints
  async getApprovals(tenantId) {
    return this.client.get('/approvals', { params: { tenant_id: tenantId } });
  }

  async approveRequest(id) {
    return this.client.post(`/approvals/${id}/approve`);
  }

  async rejectRequest(id, reason) {
    return this.client.post(`/approvals/${id}/reject`, { reason });
  }
}

const apiClient = new APIClient();
const stagingApiClient = new APIClient(STAGING_API_URL);

// ============================================================================
// STATE MANAGEMENT (Global Store)
// ============================================================================

const initialAuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  refreshToken: null,
};

const [authState, setAuthState] = React.useState(initialAuthState);

const useAuth = () => {
  const [state, setState] = React.useState(initialAuthState);

  const login = async (email, password) => {
    const response = await apiClient.login(email, password);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));

    setState({
      user,
      isAuthenticated: true,
      token: access_token,
      refreshToken: refresh_token,
    });

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setState(initialAuthState);
  };

  const loadUser = async () => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        token: storedToken,
        refreshToken: localStorage.getItem('refresh_token'),
      });
    }
  };

  return { ...state, login, logout, loadUser };
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// Alert Component
const Alert = ({ type = 'info', title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[type];

  return (
    <div className={`fixed top-4 right-4 p-4 border rounded-lg ${bgColor} ${textColor} max-w-sm`}>
      <p className="font-semibold">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
};

// Button Component
const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled = false, className = '' }) => {
  const baseStyles = 'font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Card Component
const Card = ({ title, subtitle, children, action }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    <div>{children}</div>
  </div>
);

// Modal Component
const Modal = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {actions && (
          <div className="flex justify-end gap-3 p-6 border-t">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Form Input Component
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options,
  disabled = false,
}) => {
  const isSelect = options?.length > 0;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isSelect ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={4}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={disabled}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    diagnosis: 'bg-purple-100 text-purple-800',
    estimate_pending: 'bg-yellow-100 text-yellow-800',
    approval_pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    repair: 'bg-cyan-100 text-cyan-800',
    qc_pdi: 'bg-indigo-100 text-indigo-800',
    ready: 'bg-emerald-100 text-emerald-800',
    invoiced: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

// Login Page
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <Card title="EKA-AI Login" subtitle="Enter your credentials to access the platform">
        <form onSubmit={handleSubmit} className="w-96">
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@eka-ai.com"
            required
            error={error && 'Invalid credentials'}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </form>
      </Card>
    </div>
  );
};

// Dashboard Page
const DashboardPage = ({ user }) => {
  const [kpis, setKpis] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, analyticsRes] = await Promise.all([
          apiClient.getDashboardKPIs(user?.tenant_id),
          apiClient.getAnalyticsRevenue(user?.tenant_id),
        ]);
        setKpis(kpiRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Jobs" subtitle="This month">
          <div className="text-3xl font-bold text-blue-600">{kpis?.total_jobs || 0}</div>
        </Card>
        <Card title="Revenue" subtitle="This month">
          <div className="text-3xl font-bold text-green-600">₹{kpis?.revenue || 0}</div>
        </Card>
        <Card title="Active Vehicles" subtitle="In system">
          <div className="text-3xl font-bold text-purple-600">{kpis?.active_vehicles || 0}</div>
        </Card>
        <Card title="Pending Approvals" subtitle="Action needed">
          <div className="text-3xl font-bold text-orange-600">{kpis?.pending_approvals || 0}</div>
        </Card>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <Card title="Monthly Revenue Trend" subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

// Vehicles Page
const VehiclesPage = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    fuel_type: 'petrol',
    owner_name: '',
    vin: '',
    monthly_km: 1000,
  });
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const loadVehicles = async () => {
    try {
      const response = await apiClient.getVehicles(user?.tenant_id);
      setVehicles(response.data);
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'Failed to load vehicles' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'monthly_km' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.updateVehicle(editingId, formData);
        setAlert({ type: 'success', title: 'Success', message: 'Vehicle updated successfully' });
      } else {
        await apiClient.createVehicle({
          ...formData,
          tenant_id: user?.tenant_id,
        });
        setAlert({ type: 'success', title: 'Success', message: 'Vehicle created successfully' });
      }
      setShowModal(false);
      setFormData({
        plate_number: '',
        make: '',
        model: '',
        variant: '',
        year: new Date().getFullYear(),
        fuel_type: 'petrol',
        owner_name: '',
        vin: '',
        monthly_km: 1000,
      });
      setEditingId(null);
      loadVehicles();
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.detail || 'Failed to save vehicle',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await apiClient.deleteVehicle(id);
        setAlert({ type: 'success', title: 'Success', message: 'Vehicle deleted successfully' });
        loadVehicles();
      } catch (err) {
        setAlert({ type: 'error', title: 'Error', message: 'Failed to delete vehicle' });
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <Button variant="primary" onClick={() => { setShowModal(true); setEditingId(null); }}>
          <Plus size={20} className="inline mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Vehicles Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Plate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Make</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Model</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Variant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Owner</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{vehicle.plate_number}</td>
                  <td className="px-6 py-4">{vehicle.make}</td>
                  <td className="px-6 py-4">{vehicle.model}</td>
                  <td className="px-6 py-4">{vehicle.variant}</td>
                  <td className="px-6 py-4">{vehicle.year}</td>
                  <td className="px-6 py-4">{vehicle.owner_name}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => {
                        setFormData(vehicle);
                        setEditingId(vehicle.id);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
        onClose={() => setShowModal(false)}
        actions={[
          <Button key="cancel" variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" variant="primary" onClick={handleSubmit}>
            {editingId ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <form className="space-y-4">
          <FormInput
            label="Plate Number"
            name="plate_number"
            value={formData.plate_number}
            onChange={handleInputChange}
            placeholder="KA-01-MJ-1234"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Make"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              placeholder="Maruti"
              required
            />
            <FormInput
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="Swift"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Variant"
              name="variant"
              value={formData.variant}
              onChange={handleInputChange}
              placeholder="VXI"
              required
            />
            <FormInput
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Fuel Type"
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleInputChange}
              options={[
                { value: 'petrol', label: 'Petrol' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'cng', label: 'CNG' },
                { value: 'electric', label: 'Electric' },
              ]}
            />
            <FormInput
              label="Monthly KM"
              name="monthly_km"
              type="number"
              value={formData.monthly_km}
              onChange={handleInputChange}
              required
            />
          </div>
          <FormInput
            label="Owner Name"
            name="owner_name"
            value={formData.owner_name}
            onChange={handleInputChange}
            placeholder="Rahul Sharma"
          />
          <FormInput
            label="VIN"
            name="vin"
            value={formData.vin}
            onChange={handleInputChange}
            placeholder="Vehicle Identification Number"
          />
        </form>
      </Modal>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
    </div>
  );
};

// Job Cards Page
const JobCardsPage = ({ user }) => {
  const [jobCards, setJobCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    complaint: '',
    priority: 'medium',
    assigned_mechanic: '',
    expected_completion: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadJobCards();
  }, [user]);

  const loadJobCards = async () => {
    try {
      const response = await apiClient.getJobCards(user?.tenant_id);
      setJobCards(response.data);
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'Failed to load job cards' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.createJobCard({
        ...formData,
        tenant_id: user?.tenant_id,
      });
      setAlert({ type: 'success', title: 'Success', message: 'Job card created successfully' });
      setShowModal(false);
      loadJobCards();
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.detail || 'Failed to create job card',
      });
    }
  };

  const handleStateTransition = async (jobId, newState) => {
    try {
      await apiClient.transitionJobCard(jobId, newState);
      setAlert({ type: 'success', title: 'Success', message: `Job transitioned to ${newState}` });
      loadJobCards();
      if (selectedJob?.id === jobId) {
        setSelectedJob(prev => ({ ...prev, state: newState }));
      }
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.detail || 'Failed to transition job',
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Cards</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={20} className="inline mr-2" />
          New Job
        </Button>
      </div>

      {/* Jobs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Job No</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Complaint</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobCards.map(job => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{job.job_no}</td>
                  <td className="px-6 py-4">{job.vehicle?.plate_number || 'N/A'}</td>
                  <td className="px-6 py-4">{job.complaint}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.state} />
                  </td>
                  <td className="px-6 py-4">{format(new Date(job.created_at), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye size={18} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Job Modal */}
      <Modal
        isOpen={showModal}
        title="Create New Job Card"
        onClose={() => setShowModal(false)}
        actions={[
          <Button key="cancel" variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" variant="primary" onClick={handleSubmit}>
            Create
          </Button>,
        ]}
      >
        <form className="space-y-4">
          <FormInput
            label="Vehicle"
            name="vehicle_id"
            value={formData.vehicle_id}
            onChange={handleInputChange}
            options={[{ value: '1', label: 'Vehicle 1' }]}
            required
          />
          <FormInput
            label="Complaint"
            name="complaint"
            type="textarea"
            value={formData.complaint}
            onChange={handleInputChange}
            placeholder="Describe the issue"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
            <FormInput
              label="Expected Completion"
              name="expected_completion"
              type="date"
              value={formData.expected_completion}
              onChange={handleInputChange}
            />
          </div>
          <FormInput
            label="Assigned Mechanic"
            name="assigned_mechanic"
            value={formData.assigned_mechanic}
            onChange={handleInputChange}
            placeholder="Mechanic name"
          />
        </form>
      </Modal>

      {/* Job Detail Modal */}
      {selectedJob && (
        <Modal
          isOpen={showDetailModal}
          title={`Job ${selectedJob.job_no}`}
          onClose={() => setShowDetailModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Vehicle</p>
                <p className="font-semibold">{selectedJob.vehicle?.plate_number}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <StatusBadge status={selectedJob.state} />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Complaint</p>
              <p className="font-semibold">{selectedJob.complaint}</p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">State Transitions</p>
              <div className="grid grid-cols-3 gap-2">
                {['diagnosis', 'estimate_pending', 'approval_pending', 'approved', 'repair', 'qc_pdi', 'ready', 'invoiced', 'paid'].map(state => (
                  <Button
                    key={state}
                    variant={selectedJob.state === state ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleStateTransition(selectedJob.id, state)}
                    className="text-xs"
                  >
                    {state.replace('_', ' ').toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
    </div>
  );
};

// Invoices Page
const InvoicesPage = ({ user }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, [user]);

  const loadInvoices = async () => {
    try {
      const response = await apiClient.getInvoices(user?.tenant_id);
      setInvoices(response.data);
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'Failed to load invoices' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await apiClient.downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'Failed to download PDF' });
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Invoices</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total" subtitle="All invoices">
          <div className="text-3xl font-bold text-gray-600">₹{totalAmount.toLocaleString()}</div>
        </Card>
        <Card title="Pending" subtitle="Action needed">
          <div className="text-3xl font-bold text-orange-600">₹{pendingAmount.toLocaleString()}</div>
        </Card>
        <Card title="Total Count" subtitle="Invoices">
          <div className="text-3xl font-bold text-blue-600">{invoices.length}</div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Invoice No</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{invoice.invoice_no}</td>
                  <td className="px-6 py-4">{invoice.customer_name}</td>
                  <td className="px-6 py-4">₹{invoice.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4">{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDownload(invoice.id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Download size={18} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
    </div>
  );
};

// MG Engine Page
const MGEnginePage = ({ user }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    fuel_type: 'petrol',
    city: '',
    monthly_km: 2500,
    warranty_status: 'in_warranty',
    usage_type: 'personal',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'monthly_km' ? parseInt(value) : value,
    }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.calculateMG(formData);
      setResult(response.data);
      setAlert({ type: 'success', title: 'Success', message: 'Calculation completed' });
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.detail || 'Failed to calculate MG',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Insurance Calculator (MG Engine)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card title="Vehicle Details">
            <form onSubmit={handleCalculate} className="space-y-4">
              <FormInput
                label="Make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="Maruti"
                required
              />
              <FormInput
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Swift"
                required
              />
              <FormInput
                label="Variant"
                name="variant"
                value={formData.variant}
                onChange={handleInputChange}
                placeholder="VXI"
                required
              />
              <FormInput
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label="Fuel Type"
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleInputChange}
                options={[
                  { value: 'petrol', label: 'Petrol' },
                  { value: 'diesel', label: 'Diesel' },
                  { value: 'cng', label: 'CNG' },
                ]}
              />
              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Mumbai"
                required
              />
              <FormInput
                label="Monthly KM"
                name="monthly_km"
                type="number"
                value={formData.monthly_km}
                onChange={handleInputChange}
              />
              <FormInput
                label="Warranty Status"
                name="warranty_status"
                value={formData.warranty_status}
                onChange={handleInputChange}
                options={[
                  { value: 'in_warranty', label: 'In Warranty' },
                  { value: 'out_of_warranty', label: 'Out of Warranty' },
                ]}
              />
              <FormInput
                label="Usage Type"
                name="usage_type"
                value={formData.usage_type}
                onChange={handleInputChange}
                options={[
                  { value: 'personal', label: 'Personal' },
                  { value: 'commercial', label: 'Commercial' },
                ]}
              />
              <Button variant="primary" size="lg" onClick={handleCalculate} disabled={loading} className="w-full">
                {loading ? 'Calculating...' : 'Calculate'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <div className="lg:col-span-2 space-y-6">
            <Card title="Annual Premium" subtitle="Insurance Calculation Result">
              <div className="text-5xl font-bold text-blue-600 mb-4">
                ₹{result.premium?.annual?.toLocaleString() || 0}
              </div>
              <div className="text-xl text-gray-600">
                ₹{(result.premium?.monthly || 0).toLocaleString()} / month
              </div>
            </Card>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card title="Parts Cost" subtitle="Estimated replacement">
                <div className="text-2xl font-bold text-gray-700">
                  ₹{result.breakdown?.parts_cost?.toLocaleString() || 0}
                </div>
              </Card>
              <Card title="Labor Cost" subtitle="Annual maintenance">
                <div className="text-2xl font-bold text-gray-700">
                  ₹{result.breakdown?.labor_cost?.toLocaleString() || 0}
                </div>
              </Card>
              <Card title="Risk Buffer" subtitle="Safety margin">
                <div className="text-2xl font-bold text-orange-600">
                  {(result.breakdown?.risk_multiplier * 100).toFixed(1)}%
                </div>
              </Card>
              <Card title="GST" subtitle="Applicable tax">
                <div className="text-2xl font-bold text-gray-700">
                  ₹{result.breakdown?.gst?.toLocaleString() || 0}
                </div>
              </Card>
            </div>

            {/* Chart */}
            {result.breakdown && (
              <Card title="Cost Breakdown" subtitle="Visual representation">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Parts', value: result.breakdown.parts_cost },
                        { name: 'Labor', value: result.breakdown.labor_cost },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₹${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}
      </div>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
    </div>
  );
};

// Chat Page
const ChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), text: inputValue, sender: 'user' }]);
    setLoading(true);

    try {
      const response = await apiClient.sendChatQuery(inputValue, selectedJob);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: response.data.response, sender: 'assistant' },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: 'Error getting response', sender: 'system' },
      ]);
    } finally {
      setInputValue('');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Assistant</h1>

      <Card title="Chat" subtitle="Ask questions about vehicles and repairs">
        <div className="h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-gray-50 p-4 rounded-lg">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="animate-pulse">Typing...</div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <Button variant="primary" onClick={handleSendMessage} disabled={loading}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Approvals Page
const ApprovalsPage = ({ user }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadApprovals();
  }, [user]);

  const loadApprovals = async () => {
    try {
      const response = await apiClient.getApprovals(user?.tenant_id);
      setApprovals(response.data);
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'Failed to load approvals' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiClient.approveRequest(id);
      setAlert({ type: 'success', title: 'Success', message: 'Request approved' });
      loadApprovals();
    } catch (err) {
      setAlert({ type: 'error', title: 'Error', message: 'Failed to approve' });
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (reason) {
      try {
        await apiClient.rejectRequest(id, reason);
        setAlert({ type: 'success', title: 'Success', message: 'Request rejected' });
        loadApprovals();
      } catch (err) {
        setAlert({ type: 'error', title: 'Error', message: 'Failed to reject' });
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Approvals</h1>

      <Card>
        <div className="space-y-4">
          {approvals.map(approval => (
            <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <p className="font-semibold">{approval.type}</p>
                <p className="text-sm text-gray-500">{approval.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={() => handleApprove(approval.id)}>
                  <Check size={18} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleReject(approval.id)}>
                  <AlertCircle size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
    </div>
  );
};

// ============================================================================
// MAIN APP LAYOUT
// ============================================================================

const MainLayout = ({ user, onLogout, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'vehicles', label: 'Vehicles', icon: FileText },
    { id: 'job-cards', label: 'Job Cards', icon: Wrench },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'mg-engine', label: 'Insurance', icon: TrendingUp },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'approvals', label: 'Approvals', icon: Check },
  ];

  const pages = {
    dashboard: <DashboardPage user={user} />,
    vehicles: <VehiclesPage user={user} />,
    'job-cards': <JobCardsPage user={user} />,
    invoices: <InvoicesPage user={user} />,
    'mg-engine': <MGEnginePage user={user} />,
    chat: <ChatPage user={user} />,
    approvals: <ApprovalsPage user={user} />,
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">EKA-AI</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <IconComponent size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-semibold">{user?.email}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full text-white border-white hover:bg-gray-800"
          >
            <LogOut size={18} className="inline mr-2" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {pages[currentPage] || pages.dashboard}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    auth.loadUser();
  }, []);

  if (!auth.isAuthenticated) {
    return <LoginPage onLogin={auth.login} />;
  }

  return (
    <MainLayout
      user={auth.user}
      onLogout={auth.logout}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );
}

// Export for React 19 compatibility
if (typeof window !== 'undefined') {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
}
