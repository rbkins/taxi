"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  Car,
  Home,
  MapPin,
  Settings,
  DollarSign,
  Clock,
  Users,
  Star,
  Navigation,
  Phone,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Trip {
  id: string;
  passenger: string;
  origin: string;
  destination: string;
  status: "pending" | "accepted" | "in-progress" | "completed";
  price: string;
  distance: string;
  time: string;
}

interface DriverStats {
  todayEarnings: string;
  totalTrips: number;
  rating: number;
  completionRate: number;
}

export default function DriverDashboard() {
  const { user: authUser, logout } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isOnline, setIsOnline] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar menú móvil cuando se cambia a desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  const [driverStats] = useState<DriverStats>({
    todayEarnings: "$245.50",
    totalTrips: 156,
    rating: 4.8,
    completionRate: 95,
  });

  const [availableTrips] = useState<Trip[]>([
    {
      id: "1",
      passenger: "María González",
      origin: "Centro Comercial Plaza",
      destination: "Aeropuerto Internacional",
      status: "pending",
      price: "$25.00",
      distance: "12.5 km",
      time: "25 min",
    },
    {
      id: "2",
      passenger: "Carlos Ruiz",
      origin: "Universidad Nacional",
      destination: "Zona Rosa",
      status: "pending",
      price: "$15.00",
      distance: "8.2 km",
      time: "18 min",
    },
  ]);

  const handleLogout = () => {
    logout();
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const acceptTrip = (trip: Trip) => {
    setCurrentTrip({ ...trip, status: "accepted" });
  };

  const startTrip = () => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: "in-progress" });
    }
  };

  const completeTrip = () => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: "completed" });
      setTimeout(() => setCurrentTrip(null), 2000);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) {
      setIsMobileMenuOpen(false); // Cerrar menú móvil al seleccionar
    }
  };

  // Prevenir scroll del body cuando el menú móvil esté abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Sidebar Navigation
  const sidebarItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "trips", icon: Car, label: "Viajes" },
    { id: "earnings", icon: DollarSign, label: "Ganancias" },
    { id: "profile", icon: Settings, label: "Perfil" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gray to-gray-100 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-gradient-to-b from-dark to-gray-800 text-white shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileMenuOpen
            ? "fixed inset-y-0 left-0 z-50 translate-x-0"
            : "fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 lg:p-6 h-full flex flex-col">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-4 lg:mb-6 lg:hidden">
            <span className="text-lg font-semibold">Menú</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-3 mb-6 lg:mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-dark" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-taxi-yellow to-yellow-400 bg-clip-text text-transparent">
                Taxi Seguro
              </h1>
              <p className="text-xs text-gray-400">Panel Conductor</p>
            </div>
          </div>

          {/* Online Status Toggle */}
          <div className="mb-6 lg:mb-8 p-3 lg:p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-sm font-medium">Estado</span>
              <Badge
                className={
                  isOnline ? "bg-success text-white" : "bg-gray-500 text-white"
                }
              >
                {isOnline ? "En línea" : "Desconectado"}
              </Badge>
            </div>
            <Button
              onClick={toggleOnlineStatus}
              className={`w-full ${
                isOnline
                  ? "bg-gradient-to-r from-error to-red-600 hover:from-red-600 hover:to-error"
                  : "bg-gradient-to-r from-success to-emerald-500 hover:from-emerald-500 hover:to-success"
              } text-white font-semibold py-2 lg:py-3 rounded-lg transition-all duration-300`}
            >
              {isOnline ? "Desconectarse" : "Conectarse"}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 lg:space-y-2 flex-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-300 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium text-sm lg:text-base">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Driver Info */}
          <div className="p-4 lg:p-6 bg-gradient-to-t from-black/20 to-transparent mt-auto">
            <div className="flex items-center space-x-3 mb-3 lg:mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-dark font-bold text-base lg:text-lg">
                  {authUser?.name?.[0] || "C"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm lg:text-base truncate">
                  {authUser?.name || "Conductor"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {authUser?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-sm lg:text-base"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden text-dark hover:bg-gray-100 mr-4"
            >
              <Menu className="w-6 h-6" />
            </Button>

            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-dark">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "trips" && "Gestión de Viajes"}
                {activeTab === "earnings" && "Ganancias"}
                {activeTab === "profile" && "Mi Perfil"}
              </h2>
              <p className="text-gray-600 hidden sm:block text-sm lg:text-base">
                {activeTab === "dashboard" && "Resumen de tu actividad hoy"}
                {activeTab === "trips" &&
                  "Administra tus viajes activos y disponibles"}
                {activeTab === "earnings" &&
                  "Historial de ingresos y estadísticas"}
                {activeTab === "profile" &&
                  "Configuración de tu perfil de conductor"}
              </p>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hidden sm:flex text-xs lg:text-sm">
                <Award className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">Conductor </span>Premium
              </Badge>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-dark">
                  Hoy: {driverStats.todayEarnings}
                </p>
                <p className="text-xs text-gray-500">
                  ⭐ {driverStats.rating} • {driverStats.totalTrips} viajes
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 lg:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                  {
                    title: "Ganancias Hoy",
                    value: driverStats.todayEarnings,
                    icon: DollarSign,
                    color: "from-green-500 to-emerald-500",
                    change: "+15%",
                  },
                  {
                    title: "Viajes Completados",
                    value: driverStats.totalTrips.toString(),
                    icon: Car,
                    color: "from-blue-500 to-cyan-500",
                    change: "+8%",
                  },
                  {
                    title: "Calificación",
                    value: driverStats.rating.toString(),
                    icon: Star,
                    color: "from-yellow-500 to-orange-500",
                    change: "+0.2",
                  },
                  {
                    title: "Tasa Completación",
                    value: `${driverStats.completionRate}%`,
                    icon: Activity,
                    color: "from-purple-500 to-pink-500",
                    change: "+2%",
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-2xl lg:text-3xl font-bold text-dark">
                            {stat.value}
                          </p>
                          <p className="text-sm text-success font-medium mt-1">
                            {stat.change}
                          </p>
                        </div>
                        <div
                          className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}
                        >
                          <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Current Trip or Available Trips */}
              {currentTrip ? (
                <Card className="bg-gradient-to-r from-taxi-yellow/10 to-yellow-50 border-taxi-yellow shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-dark flex items-center space-x-2">
                      <Navigation className="w-6 h-6 text-taxi-yellow" />
                      <span>Viaje Actual</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-dark text-lg">
                          {currentTrip.passenger}
                        </h3>
                        <p className="text-gray-600">
                          {currentTrip.price} • {currentTrip.distance}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          currentTrip.status === "accepted"
                            ? "bg-blue-500"
                            : currentTrip.status === "in-progress"
                            ? "bg-taxi-yellow text-dark"
                            : "bg-success"
                        } text-white`}
                      >
                        {currentTrip.status === "accepted" && "Aceptado"}
                        {currentTrip.status === "in-progress" && "En Progreso"}
                        {currentTrip.status === "completed" && "Completado"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-3 h-3 bg-success rounded-full"></div>
                          <div className="w-0.5 h-8 bg-gray-300"></div>
                          <div className="w-3 h-3 bg-error rounded-full"></div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Origen</p>
                            <p className="font-medium text-dark">
                              {currentTrip.origin}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Destino</p>
                            <p className="font-medium text-dark">
                              {currentTrip.destination}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      {currentTrip.status === "accepted" && (
                        <Button
                          onClick={startTrip}
                          className="flex-1 bg-gradient-to-r from-success to-emerald-500 hover:from-emerald-500 hover:to-success text-white font-semibold py-3"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Iniciar Viaje
                        </Button>
                      )}
                      {currentTrip.status === "in-progress" && (
                        <Button
                          onClick={completeTrip}
                          className="flex-1 bg-gradient-to-r from-taxi-yellow to-yellow-400 hover:from-yellow-400 hover:to-taxi-yellow text-dark font-semibold py-3"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Finalizar Viaje
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none border-error text-error hover:bg-error hover:text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                isOnline && (
                  <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="text-dark flex items-center space-x-2">
                        <MapPin className="w-6 h-6 text-taxi-yellow" />
                        <span>Viajes Disponibles</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {availableTrips.map((trip) => (
                        <Card
                          key={trip.id}
                          className="bg-gray-50 border-gray-200 hover:shadow-md transition-all duration-300"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-dark">
                                  {trip.passenger}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {trip.distance} • {trip.time}
                                </p>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <p className="text-xl font-bold text-dark mb-2">
                                  {trip.price}
                                </p>
                                <Button
                                  onClick={() => acceptTrip(trip)}
                                  className="bg-gradient-to-r from-taxi-yellow to-yellow-400 hover:from-yellow-400 hover:to-taxi-yellow text-dark font-semibold px-4 py-2"
                                  size="sm"
                                >
                                  Aceptar
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-start space-x-2 text-sm">
                              <div className="flex flex-col items-center space-y-1">
                                <div className="w-2 h-2 bg-success rounded-full"></div>
                                <div className="w-0.5 h-4 bg-gray-300"></div>
                                <div className="w-2 h-2 bg-error rounded-full"></div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-gray-600">{trip.origin}</p>
                                <p className="text-gray-600">
                                  {trip.destination}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === "trips" && (
            <div className="space-y-4 lg:space-y-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-dark">
                    Historial de Viajes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Próximamente: Historial completo de viajes realizados
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div className="space-y-4 lg:space-y-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-dark">
                    Resumen de Ganancias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Próximamente: Estadísticas detalladas de ingresos
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4 lg:space-y-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-dark">
                    Perfil del Conductor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Próximamente: Configuración del perfil
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
