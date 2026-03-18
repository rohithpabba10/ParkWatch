import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import QrScanner from 'qr-scanner';
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';
import './App.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Separator } from './components/ui/separator';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './components/ui/dropdown-menu';
import { QrCode, Car, Camera, MessageSquare, Shield, Upload, MapPin, Clock, CheckCircle, AlertTriangle, User, Phone, Mail, LogOut, Home } from 'lucide-react';

// Configure axios
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
axios.defaults.baseURL = API_BASE_URL;

// Auth context
const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could verify token here
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={!token ? <AuthPage /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/scan/:vehicleId?" element={<ScanPage />} />
            <Route path="/vehicle/:vehicleId" element={<VehicleDetailsPage />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// Landing Page
function LandingPage() {
  const { logout } = React.useContext(AuthContext);

  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ParkWatch
              </h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" asChild>
                <a href="/auth">Sign In</a>
              </Button>
              <Button asChild>
                <a href="/auth">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Smart Parking Solution
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Stop Parking
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
              Violations
            </span>
            with AI
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Scan, Report, and Resolve parking violations instantly with AI-powered image analysis and direct owner communication.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all" asChild>
              <a href="/auth">Register Your Vehicle</a>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-slate-300 px-8 py-3 rounded-xl hover:bg-slate-50" asChild>
              <a href="#how-it-works">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How ParkWatch Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple, secure, and smart parking violation reporting system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "Scan QR Code",
                description: "Find a QR code on the vehicle and scan it to access the reporting interface",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Camera,
                title: "Take Photos",
                description: "Capture clear images of the parking violation as evidence",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: MessageSquare,
                title: "AI Analysis",
                description: "Our AI analyzes the images and determines if there's a genuine violation",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose ParkWatch?</h2>
            <p className="text-lg text-slate-600">Built for the modern parking ecosystem</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "AI-Powered", desc: "Smart violation detection" },
              { icon: MessageSquare, title: "Direct Communication", desc: "Contact owners securely" },
              { icon: QrCode, title: "QR Integration", desc: "Easy scanning system" },
              { icon: Clock, title: "24/7 Available", desc: "Report anytime, anywhere" }
            ].map((benefit, index) => (
              <Card key={index} className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-600">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
              <Car className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">ParkWatch</h1>
          </div>
          <p className="text-slate-400 mb-6">
            Making parking fair and accessible for everyone through smart technology.
          </p>
          <p className="text-slate-500 text-sm">
            © 2024 ParkWatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Auth Page
function AuthPage() {
  const { login } = React.useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = isLogin ? 
        { email: formData.email, password: formData.password } : 
        formData;

      const response = await axios.post(endpoint, data);
      const userData = response.data.user || {
        name: formData.name || formData.email,
        email: formData.email,
        phone: formData.phone
      };
      const authToken = response.data.access_token || response.data.token || response.data.message || Math.random().toString(36).slice(2);
      login(userData, authToken);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <Car className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-slate-900">
              {isLogin ? 'Welcome Back' : 'Join ParkWatch'}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required={!isLogin}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" 
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vehiclesRes, complaintsRes, conversationsRes] = await Promise.all([
        axios.get('/api/vehicles/my'),
        axios.get('/api/complaints/my'),
        axios.get('/api/messages/conversations')
      ]);
      setVehicles(vehiclesRes.data);
      setComplaints(complaintsRes.data);
      setConversations(conversationsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ParkWatch
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
              >
                <Link to="/scan" className="inline-flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-indigo-500 text-white">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700">{user?.name}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8} className="w-72">
                  <DropdownMenuLabel className="px-3 pt-3 text-sm font-semibold">Account</DropdownMenuLabel>
                  <div className="px-3 pb-3 text-sm">
                    <div className="font-medium text-slate-900">{user?.name || 'User'}</div>
                    {user?.email && <div className="text-slate-500 text-xs">{user.email}</div>}
                    {user?.phone && <div className="text-slate-500 text-xs">{user.phone}</div>}
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onSelect={() => navigate('/scan')}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Report Violation
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">Manage your vehicles and parking reports</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="vehicles" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Car className="h-4 w-4 mr-2" />
              My Vehicles
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Upload className="h-4 w-4 mr-2" />
              Register Vehicle
            </TabsTrigger>
            <TabsTrigger value="complaints" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              My Reports
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-6">
            <VehiclesTab vehicles={vehicles} onUpdate={loadDashboardData} />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterVehicleTab onUpdate={loadDashboardData} />
          </TabsContent>

          <TabsContent value="complaints" className="mt-6">
            <ComplaintsTab complaints={complaints} />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <MessagesTab conversations={conversations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Vehicles Tab
function VehiclesTab({ vehicles, onUpdate }) {
  return (
    <div className="grid gap-6">
      {vehicles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Car className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No vehicles registered</h3>
            <p className="text-slate-600 mb-4">Register your first vehicle to get started</p>
            <Button>Register Vehicle</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.vehicle_id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-slate-900">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {vehicle.license_plate} • {vehicle.color}
                    </CardDescription>
                  </div>
                  <Badge variant={vehicle.is_verified ? "default" : "secondary"}>
                    {vehicle.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-slate-600 mb-2">QR Code for your vehicle:</p>
                  <img 
                    src={`data:image/png;base64,${vehicle.qr_code}`}
                    alt="Vehicle QR Code"
                    className="w-24 h-24 mx-auto border rounded-lg"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <QrCode className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Register Vehicle Tab
function RegisterVehicleTab({ onUpdate }) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    license_plate: '',
    color: ''
  });
  const [vehicleImage, setVehicleImage] = useState(null);
  const [ownershipProof, setOwnershipProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleImage || !ownershipProof) {
      setError('Please upload both vehicle image and ownership proof');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      formDataObj.append('vehicle_image', vehicleImage);
      formDataObj.append('ownership_proof', ownershipProof);

      const response = await axios.post('/api/vehicles/register', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Vehicle registered successfully! Your QR code has been generated.');
      setFormData({ make: '', model: '', license_plate: '', color: '' });
      setVehicleImage(null);
      setOwnershipProof(null);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-slate-900">Register New Vehicle</CardTitle>
        <CardDescription className="text-slate-600">
          Add your vehicle details and get a unique QR code
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="make">Vehicle Make</Label>
              <Input
                id="make"
                name="make"
                type="text"
                required
                value={formData.make}
                onChange={handleInputChange}
                placeholder="e.g., Toyota, Honda"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="model">Vehicle Model</Label>
              <Input
                id="model"
                name="model"
                type="text"
                required
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., Camry, Civic"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="license_plate">License Plate</Label>
              <Input
                id="license_plate"
                name="license_plate"
                type="text"
                required
                value={formData.license_plate}
                onChange={handleInputChange}
                placeholder="e.g., ABC-123"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="color">Vehicle Color</Label>
              <Input
                id="color"
                name="color"
                type="text"
                required
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., White, Black"
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <div>
              <Label htmlFor="vehicle_image">Vehicle Image</Label>
              <Input
                id="vehicle_image"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setVehicleImage(e.target.files[0])}
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Upload a clear image of your vehicle
              </p>
            </div>

            <div>
              <Label htmlFor="ownership_proof">Ownership Proof</Label>
              <Input
                id="ownership_proof"
                type="file"
                accept="image/*,.pdf"
                required
                onChange={(e) => setOwnershipProof(e.target.files[0])}
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Upload RC book, registration certificate, or other proof of ownership
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Vehicle'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Complaints Tab
function ComplaintsTab({ complaints }) {
  return (
    <div className="space-y-6">
      {complaints.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No reports filed</h3>
            <p className="text-slate-600">Your parking violation reports will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint.complaint_id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-slate-900">
                      {complaint.vehicle_info?.make} {complaint.vehicle_info?.model}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {complaint.vehicle_info?.license_plate} • {complaint.location}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={complaint.is_violation ? "destructive" : "secondary"}>
                      {complaint.is_violation ? "Violation Confirmed" : "No Violation"}
                    </Badge>
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">{complaint.description}</p>
                {complaint.ai_analysis && (
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-slate-900 mb-2">AI Analysis</h4>
                    <p className="text-sm text-slate-600">{complaint.ai_analysis.analysis}</p>
                    {complaint.ai_analysis.confidence && (
                      <p className="text-sm text-slate-500 mt-2">
                        Confidence: {Math.round(complaint.ai_analysis.confidence * 100)}%
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Messages Tab
function MessagesTab({ conversations }) {
  return (
    <div className="space-y-6">
      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No conversations</h3>
            <p className="text-slate-600">Your messages with other users will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card key={conversation.partner_id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-indigo-500 text-white">
                      {conversation.partner_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-slate-900">
                      {conversation.partner_name}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {conversation.messages.length} messages
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {conversation.messages.slice(0, 3).map((message) => (
                  <div key={message.message_id} className="mb-2 last:mb-0">
                    <p className="text-sm text-slate-700 line-clamp-2">{message.content}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View Conversation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Scan Page - For scanning QR codes and reporting violations
function ScanPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanValue, setScanValue] = useState('');
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/vehicles/${vehicleId}`);
      setVehicle(response.data);
    } catch (err) {
      console.error('Error loading vehicle:', err);
      setError('Unable to find a vehicle for that QR code.');
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    if (!scanValue.trim()) {
      setError('Please enter a valid vehicle ID or scan value.');
      return;
    }
    setError('');
    navigate(`/scan/${encodeURIComponent(scanValue.trim())}`);
  };

  const stopCameraScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const startCameraScan = async () => {
    setCameraError('');
    if (!videoRef.current) {
      setCameraError('Camera not available');
      return;
    }

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          stopCameraScan();
          setScanValue(result);
          navigate(`/scan/${encodeURIComponent(result)}`);
        },
        {
          returnDetailedScanResult: true,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
      setCameraActive(true);
    } catch (err) {
      console.error('QR Scanner error:', err);
      setCameraError('Unable to access camera. Please ensure you allowed camera permission.');
    }
  };

  useEffect(() => {
    return () => stopCameraScan();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  if (!vehicleId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Vehicle QR Code</CardTitle>
            <CardDescription className="text-slate-600">
              Enter the vehicle ID printed on the QR code or scan it with a compatible app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || cameraError) && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error || cameraError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3">
              <Input
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                placeholder="Enter vehicle ID from QR code"
              />

              {cameraActive ? (
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-xl border">
                    <video ref={videoRef} className="w-full h-64 object-cover" muted />
                  </div>
                  <Button variant="outline" onClick={stopCameraScan} className="w-full">
                    Stop Camera
                  </Button>
                </div>
              ) : (
                <Button onClick={startCameraScan} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan with Camera
                </Button>
              )}

              <Button onClick={handleScan} className="w-full">
                <QrCode className="h-4 w-4 mr-2" />
                Scan (Manual)
              </Button>
            </div>
            <Button variant="ghost" asChild>
              <a href="/">Back to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Vehicle Not Found</h3>
            <p className="text-slate-600 mb-4">The QR code you scanned is not valid or the vehicle is not registered.</p>
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reportMode) {
    return <ReportViolation vehicle={vehicle} onBack={() => setReportMode(false)} />;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Vehicle Information</CardTitle>
            <CardDescription className="text-slate-600">
              You've scanned the QR code for this vehicle
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Make & Model</p>
                  <p className="text-lg font-semibold text-slate-900">{vehicle.make} {vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">License Plate</p>
                  <p className="text-lg font-semibold text-slate-900">{vehicle.license_plate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Color</p>
                  <p className="text-lg font-semibold text-slate-900">{vehicle.color}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Owner</p>
                  <p className="text-lg font-semibold text-slate-900">{vehicle.owner_name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Is this vehicle parked improperly?</h3>
              <p className="text-slate-600">
                If you believe this vehicle is violating parking rules, you can report it. Our AI will analyze the images to determine if there's a genuine violation.
              </p>

              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg"
                  onClick={() => setReportMode(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Report Violation
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Report Violation Component
function ReportViolation({ vehicle, onBack }) {
  const [formData, setFormData] = useState({
    description: '',
    location: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please upload at least one image as evidence');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('vehicle_id', vehicle.vehicle_id);
      formDataObj.append('description', formData.description);
      formDataObj.append('location', formData.location);
      
      images.forEach((image, index) => {
        formDataObj.append('complaint_images', image);
      });

      const response = await axios.post('/api/complaints/submit', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (success) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl text-center">
            <CardContent className="py-12">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Report Submitted!</h2>
              
              <div className="bg-slate-50 p-6 rounded-xl border mb-6 text-left">
                <h3 className="font-semibold text-slate-900 mb-4">AI Analysis Results:</h3>
                
                {success.ai_analysis.is_violation ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="font-medium text-red-700">Parking Violation Detected</span>
                    </div>
                    
                    <p className="text-slate-700">{success.ai_analysis.analysis}</p>
                    
                    {success.ai_analysis.violation_type && (
                      <p className="text-sm text-slate-600">
                        <strong>Type:</strong> {success.ai_analysis.violation_type}
                      </p>
                    )}
                    
                    <p className="text-sm text-slate-500">
                      Confidence: {Math.round(success.ai_analysis.confidence * 100)}%
                    </p>

                    <Separator className="my-4" />

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Owner Contact Information:</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p><strong>Name:</strong> {vehicle.owner_name}</p>
                        <p><strong>Phone:</strong> {vehicle.owner_phone}</p>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        You can now contact the vehicle owner to resolve this issue directly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-700">No Parking Violation Detected</span>
                    </div>
                    
                    <p className="text-slate-700">{success.ai_analysis.analysis}</p>
                    
                    <p className="text-sm text-slate-500">
                      Confidence: {Math.round(success.ai_analysis.confidence * 100)}%
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <Button onClick={onBack} variant="outline" className="flex-1">
                  Go Back
                </Button>
                <Button asChild className="flex-1">
                  <a href="/">Go Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <div>
                <CardTitle className="text-xl text-slate-900">Report Parking Violation</CardTitle>
                <CardDescription className="text-slate-600">
                  {vehicle.make} {vehicle.model} • {vehicle.license_plate}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Street Parking Lot"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the parking violation (e.g., blocking driveway, parked in disabled spot)"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="images">Evidence Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="mt-1"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Upload clear photos showing the parking violation
                </p>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="bg-slate-100 p-2 rounded-lg border">
                          <p className="text-sm text-slate-600 truncate">{image.name}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 rounded-full p-1 mt-1">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">AI-Powered Verification</h4>
                    <p className="text-sm text-blue-700">
                      Our AI will analyze your images to verify if there's a genuine parking violation before revealing owner contact information.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Images...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Vehicle Details Page (accessed from scanning)
function VehicleDetailsPage() {
  // This would be similar to ScanPage but accessed via direct URL
  return <ScanPage />;
}

export default App;