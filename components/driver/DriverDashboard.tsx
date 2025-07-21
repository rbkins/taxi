"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTrip } from "@/contexts/TripContext";
import { locationService } from "@/services/LocationService";
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
  Edit2,
  Save,
  Trash2,
  User,
  Camera,
  PieChart,
  BarChart3,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import TripOfferStatus from "@/components/TripOfferStatus";

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
  const { toast } = useToast();
  const {
    connectDriver,
    disconnectDriver,
    connectedDrivers,
    notifications,
    markNotificationAsRead,
    refreshConnectedDrivers,
    respondToOffer,
    getTripHistory,
    markTripAsCompleted,
  } = useTrip();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isOnline, setIsOnline] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [justUpdated, setJustUpdated] = useState(false); // Para evitar sobreescribir estado recién actualizado
  const [driverTripHistory, setDriverTripHistory] = useState<any[]>([]);

  // Estados para el perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedLicense, setEditedLicense] = useState("");

  // ID consistente del conductor
  const driverId = authUser?.id;

  // Cerrar menú móvil cuando se cambia a desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Actualizar estados cuando cambie authUser
  useEffect(() => {
    if (authUser) {
      setEditedName(authUser.name || "");
      setEditedEmail(authUser.email || "");
      setEditedPhone(authUser.phone || "");
      setEditedLicense(authUser.driverLicense || "");
    }
  }, [authUser]);

  const [driverStats] = useState<DriverStats>({
    todayEarnings: "$245.50",
    totalTrips: 156,
    rating: 4.8,
    completionRate: 95,
  });

  // Filtrar notificaciones de solicitudes de viaje para este conductor
  const tripNotifications = notifications.filter((n) => {
    return n.recipientId === driverId && n.type === "trip-request" && !n.read;
  });

  // Función para aceptar oferta
  const handleAcceptOffer = async (offerId: string) => {
    try {
      await respondToOffer(offerId, "accept");

      // Simular duración del viaje (30 segundos) y luego ir a trips
      setTimeout(() => {
        setActiveTab("trips");
      }, 30000); // 30 segundos
    } catch (error) {
      console.error("❌ Error aceptando oferta:", error);
      alert("Error al aceptar la oferta");
    }
  };

  // Función para rechazar oferta
  const handleRejectOffer = async (offerId: string) => {
    try {
      await respondToOffer(offerId, "reject");
    } catch (error) {
      console.error("❌ Error rechazando oferta:", error);
      alert("Error al rechazar la oferta");
    }
  };

  // Funciones para el perfil del conductor
  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditedName(authUser?.name || "");
    setEditedEmail(authUser?.email || "");
    setEditedPhone(authUser?.phone || "");
    setEditedLicense(authUser?.driverLicense || "");
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim() || !editedEmail.trim() || !editedLicense.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: editedName.trim(),
          email: editedEmail.trim(),
          phone: editedPhone.trim(),
          driverLicense: editedLicense.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Perfil actualizado",
          description: "Tu información ha sido actualizada correctamente",
        });
        setIsEditingProfile(false);
        // Refrescar la información del usuario
        window.location.reload();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Error al actualizar el perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Cuenta eliminada",
          description: "Tu cuenta de conductor ha sido eliminada",
        });
        logout();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Error al eliminar la cuenta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al eliminar la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
      setShowDeleteConfirm(false);
    }
  };

  // Calcular estadísticas de ganancias
  const calculateEarningsStats = () => {
    if (!driverTripHistory || !Array.isArray(driverTripHistory)) {
      return {
        today: { trips: 0, earnings: 0 },
        week: { trips: 0, earnings: 0 },
        month: { trips: 0, earnings: 0 },
        total: { trips: 0, earnings: 0 },
        avgPerTrip: 0,
      };
    }

    const completedTrips = driverTripHistory.filter(
      (trip) => trip && trip.status === "completed"
    );

    const today = new Date();
    const currentWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayTrips = completedTrips.filter((trip) => {
      const tripDate = new Date(trip.createdAt);
      return tripDate.toDateString() === today.toDateString();
    });

    const weekTrips = completedTrips.filter((trip) => {
      const tripDate = new Date(trip.createdAt);
      return tripDate >= currentWeek;
    });

    const monthTrips = completedTrips.filter((trip) => {
      const tripDate = new Date(trip.createdAt);
      return tripDate >= currentMonth;
    });

    const todayEarnings = todayTrips.reduce(
      (sum, trip) => sum + (trip.price || 0),
      0
    );
    const weekEarnings = weekTrips.reduce(
      (sum, trip) => sum + (trip.price || 0),
      0
    );
    const monthEarnings = monthTrips.reduce(
      (sum, trip) => sum + (trip.price || 0),
      0
    );
    const totalEarnings = completedTrips.reduce(
      (sum, trip) => sum + (trip.price || 0),
      0
    );

    return {
      today: { trips: todayTrips.length, earnings: todayEarnings },
      week: { trips: weekTrips.length, earnings: weekEarnings },
      month: { trips: monthTrips.length, earnings: monthEarnings },
      total: { trips: completedTrips.length, earnings: totalEarnings },
      avgPerTrip:
        completedTrips.length > 0 ? totalEarnings / completedTrips.length : 0,
    };
  };

  const earningsStats = calculateEarningsStats();

  const handleLogout = () => {
    logout();
  };

  // Funciones para conectar/desconectar
  const handleToggleConnection = async () => {
    if (!driverId) {
      console.error("No hay usuario autenticado para conectar");
      alert("Debes estar autenticado como conductor para conectarte");
      return;
    }

    if (isOnline) {
      // Desconectar
      setIsConnecting(true);
      try {
        await disconnectDriver(driverId);

        // Forzar actualización del estado local inmediatamente
        setIsOnline(false);
        setCurrentLocation(null);
        setJustUpdated(true); // Marcar que acabamos de actualizar

        // Forzar actualización de la lista de conductores conectados (con delay)
        setTimeout(async () => {
          await refreshConnectedDrivers();
        }, 1000);

        // Limpiar la marca después de un tiempo (aumentamos a 5 segundos)
        setTimeout(() => setJustUpdated(false), 5000);
      } catch (error) {
        console.error("Error disconnecting:", error);
        alert("Error al desconectar: " + error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Conectar
      setIsConnecting(true);
      try {
        // Obtener ubicación actual
        const location = await locationService.getCurrentLocation();
        setCurrentLocation(location);

        // Conectar conductor
        const result = await connectDriver(driverId, location);

        // Forzar actualización del estado local inmediatamente
        setIsOnline(true);
        setJustUpdated(true); // Marcar que acabamos de actualizar

        // Forzar actualización de la lista de conductores conectados (con delay)
        setTimeout(async () => {
          await refreshConnectedDrivers();
        }, 1000);

        // Limpiar la marca después de un tiempo (aumentamos a 5 segundos)
        setTimeout(() => setJustUpdated(false), 5000);
      } catch (error) {
        console.error("Error connecting:", error);
        alert("Error al conectar: " + error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  // Verificar si el conductor está conectado
  useEffect(() => {
    if (!driverId) return; // No verificar si no hay usuario autenticado
    if (justUpdated) return; // No sobreescribir si acabamos de actualizar

    // Buscar el conductor en la lista de conectados
    const connectedDriver = connectedDrivers.find((d) => {
      return d.id === driverId;
    });

    const isDriverOnline = connectedDriver?.isOnline || false;

    // Forzar actualización del estado si hay cambio
    if (isOnline !== isDriverOnline) {
      setIsOnline(isDriverOnline);
    }
  }, [connectedDrivers, driverId, isOnline, justUpdated]);

  const toggleOnlineStatus = () => {
    handleToggleConnection();
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

  // Cargar historial de viajes cuando se accede a la pestaña trips
  useEffect(() => {
    const loadDriverTripHistory = async () => {
      if (activeTab === "trips" && authUser?.id) {
        try {
          const history = await getTripHistory();
          setDriverTripHistory(history);
        } catch (error) {
          console.error("❌ Error loading driver trip history:", error);
        }
      }
    };

    loadDriverTripHistory();
  }, [activeTab, authUser, getTripHistory]);

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
              {/* Botón de conexión */}
              <Button
                onClick={handleToggleConnection}
                disabled={isConnecting}
                className={`${
                  isOnline
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                size="sm"
              >
                {isConnecting ? (
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                ) : isOnline ? (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Desconectar
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Conectar
                  </>
                )}
              </Button>

              {/* Notificaciones */}
              {isOnline &&
                driverId &&
                notifications.filter((n) => n.recipientId === driverId).length >
                  0 && (
                  <div className="relative">
                    <Button variant="outline" size="sm" className="relative">
                      <AlertCircle className="w-4 h-4" />
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                        {
                          notifications.filter(
                            (n) => n.recipientId === driverId && !n.read
                          ).length
                        }
                      </Badge>
                    </Button>
                  </div>
                )}

              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hidden sm:flex text-xs lg:text-sm">
                <Award className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">Conductor </span>Premium
              </Badge>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-dark">
                  Total: $
                  {driverTripHistory
                    .reduce((sum, trip) => sum + (trip.fare || 0), 0)
                    .toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  ⭐ {driverStats.rating} • {driverTripHistory.length} viajes
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
                    title: "Ganancias Totales",
                    value: `$${driverTripHistory
                      .reduce((sum, trip) => sum + (trip.fare || 0), 0)
                      .toFixed(2)}`,
                    icon: DollarSign,
                    color: "from-green-500 to-emerald-500",
                    change: "+15%",
                  },
                  {
                    title: "Viajes Completados",
                    value: driverTripHistory.length.toString(),
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
                              {typeof currentTrip.origin === "string"
                                ? currentTrip.origin
                                : currentTrip.origin?.address ||
                                  "No especificado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Destino</p>
                            <p className="font-medium text-dark">
                              {typeof currentTrip.destination === "string"
                                ? currentTrip.destination
                                : currentTrip.destination?.address ||
                                  "No especificado"}
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
                        <AlertCircle className="w-6 h-6 text-taxi-yellow" />
                        <span>Solicitudes de Viaje</span>
                        {tripNotifications.length > 0 && (
                          <Badge className="bg-error text-white">
                            {tripNotifications.length}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tripNotifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No hay solicitudes de viaje en este momento</p>
                          <p className="text-sm">
                            Mantente conectado para recibir ofertas
                          </p>
                        </div>
                      ) : (
                        tripNotifications.map((notification) => {
                          return (
                            <TripOfferStatus
                              key={notification.id}
                              offer={{
                                id:
                                  notification.tripId?.toString() ||
                                  notification.id,
                                clientName:
                                  notification.clientName || "Cliente",
                                origin: notification.origin || {
                                  address: "N/A",
                                  lat: 0,
                                  lng: 0,
                                },
                                destination: notification.destination || {
                                  address: "N/A",
                                  lat: 0,
                                  lng: 0,
                                },
                                proposedFare: notification.currentOffer || 0,
                                distance: notification.distance || 0,
                                estimatedTime: notification.estimatedTime || 0,
                                createdAt: new Date(
                                  notification.createdAt || Date.now()
                                ),
                                status: "pending",
                              }}
                              onAccept={handleAcceptOffer}
                              onReject={handleRejectOffer}
                            />
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === "trips" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-dark">Mis Viajes</h3>
                  <p className="text-gray-600">
                    {driverTripHistory.length} viajes completados
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark">
                  Total: $
                  {driverTripHistory
                    .reduce((sum, trip) => sum + (trip.fare || 0), 0)
                    .toFixed(2)}
                </Badge>
              </div>

              {driverTripHistory.length === 0 ? (
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-8 text-center">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No tienes viajes completados aún
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Tus viajes como conductor aparecerán aquí
                    </p>
                  </CardContent>
                </Card>
              ) : (
                driverTripHistory.map((trip) => (
                  <Card
                    key={trip.id || trip.tripId}
                    className="bg-white shadow-lg border-0"
                  >
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                            <Car className="w-5 h-5 text-dark" />
                          </div>
                          <div>
                            <Badge className="bg-success text-white mb-1">
                              Completado
                            </Badge>
                            <p className="text-sm text-gray-500">
                              {new Date(trip.createdAt).toLocaleDateString(
                                "es-ES"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-dark">
                            ${trip.fare?.toFixed(2) || "0.00"}
                          </p>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 text-taxi-yellow fill-current"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Origen</p>
                          <p className="font-medium text-dark">
                            {typeof trip.origin === "string"
                              ? trip.origin
                              : trip.origin?.address || "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Destino</p>
                          <p className="font-medium text-dark">
                            {typeof trip.destination === "string"
                              ? trip.destination
                              : trip.destination?.address || "No especificado"}
                          </p>
                        </div>
                        {trip.passengerName && (
                          <div>
                            <p className="text-sm text-gray-500">Pasajero</p>
                            <p className="font-medium text-dark">
                              {trip.passengerName}
                            </p>
                          </div>
                        )}
                        {trip.distance && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Distancia:</span>
                            <span className="font-medium">
                              {trip.distance} km
                            </span>
                          </div>
                        )}
                        {trip.estimatedTime && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tiempo:</span>
                            <span className="font-medium">
                              {trip.estimatedTime} min
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end items-center mt-4">
                        <Badge variant="outline" className="text-xs">
                          ID: {trip.id?.slice(-6) || "N/A"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div className="space-y-4 lg:space-y-6">
              {/* Resumen de ganancias por período */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <Wallet className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      ${earningsStats.today.earnings.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">Hoy</p>
                    <p className="text-xs opacity-75">
                      {earningsStats.today.trips} viajes
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      ${earningsStats.week.earnings.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">Esta semana</p>
                    <p className="text-xs opacity-75">
                      {earningsStats.week.trips} viajes
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      ${earningsStats.month.earnings.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">Este mes</p>
                    <p className="text-xs opacity-75">
                      {earningsStats.month.trips} viajes
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <Award className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      ${earningsStats.total.earnings.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">Total</p>
                    <p className="text-xs opacity-75">
                      {earningsStats.total.trips} viajes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Estadísticas detalladas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center text-dark">
                      <BarChart3 className="w-5 h-5 mr-2 text-taxi-yellow" />
                      Estadísticas de rendimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-dark">
                        Promedio por viaje
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ${earningsStats.avgPerTrip.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-dark">
                        Viajes completados
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {earningsStats.total.trips}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-dark">
                        Calificación promedio
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-lg font-bold text-yellow-600">
                          4.8
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center text-dark">
                      <PieChart className="w-5 h-5 mr-2 text-taxi-yellow" />
                      Resumen del mes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Días trabajados</span>
                        <span className="font-medium">
                          {Math.min(earningsStats.month.trips, 30)} días
                        </span>
                      </div>
                      <Progress
                        value={(earningsStats.month.trips / 30) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Meta mensual</span>
                        <span className="font-medium">
                          $
                          {Math.min(earningsStats.month.earnings, 2000).toFixed(
                            0
                          )}{" "}
                          / $2,000
                        </span>
                      </div>
                      <Progress
                        value={(earningsStats.month.earnings / 2000) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="bg-gradient-to-r from-taxi-yellow/20 to-yellow-200/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-dark">
                        {earningsStats.month.earnings >= 2000
                          ? "¡Felicidades! Has alcanzado tu meta mensual"
                          : `Te faltan $${(
                              2000 - earningsStats.month.earnings
                            ).toFixed(2)} para tu meta`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Historial de ganancias recientes */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-dark">
                    <Clock className="w-5 h-5 mr-2 text-taxi-yellow" />
                    Ganancias recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {driverTripHistory.filter(
                    (trip) => trip.status === "completed"
                  ).length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No tienes ganancias registradas aún
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Completa viajes para ver tus ganancias aquí
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {driverTripHistory
                        .filter((trip) => trip.status === "completed")
                        .slice(0, 5)
                        .map((trip, index) => (
                          <div
                            key={trip.id || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-dark">
                                  {typeof trip.destination === "string"
                                    ? trip.destination
                                    : trip.destination?.address ||
                                      "Destino no especificado"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(trip.createdAt).toLocaleDateString(
                                    "es-ES",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                +${(trip.price || trip.fare || 0).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {trip.distance} km
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4 lg:space-y-6">
              {/* Información del conductor */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-dark">
                    <User className="w-5 h-5 mr-2 text-taxi-yellow" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Foto del conductor */}
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                      {authUser?.driverPhoto ? (
                        <img
                          src={authUser.driverPhoto}
                          alt="Foto del conductor"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-dark" />
                      )}
                    </div>
                    {!isEditingProfile && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-taxi-yellow border-taxi-yellow hover:bg-taxi-yellow hover:text-dark"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Cambiar foto
                      </Button>
                    )}
                  </div>

                  {/* Información del perfil */}
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Nombre completo
                          </label>
                          <Input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="mt-1"
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <Input
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            className="mt-1"
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Teléfono
                          </label>
                          <Input
                            type="tel"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            className="mt-1"
                            placeholder="+504 9999-9999"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Licencia de conducir
                          </label>
                          <Input
                            type="text"
                            value={editedLicense}
                            onChange={(e) => setEditedLicense(e.target.value)}
                            className="mt-1"
                            placeholder="Número de licencia"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Nombre</p>
                          <p className="font-bold text-dark">
                            {authUser?.name || "No especificado"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-bold text-dark">
                            {authUser?.email || "No especificado"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Teléfono</p>
                          <p className="font-bold text-dark">
                            {authUser?.phone || "No especificado"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Licencia de conducir
                          </p>
                          <p className="font-bold text-dark">
                            {authUser?.driverLicense || "No especificada"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-taxi-yellow/20 to-yellow-200/20 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Estado</p>
                        <Badge
                          className={`${
                            isOnline
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          } text-lg px-4 py-2`}
                        >
                          {isOnline ? "En línea" : "Desconectado"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="space-y-3 pt-4 border-t">
                    {isEditingProfile ? (
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isUpdatingProfile}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3"
                        >
                          {isUpdatingProfile ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar cambios
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex-1 py-3"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={handleEditProfile}
                          className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark font-semibold py-3"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar información
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(true)}
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 py-3"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar Cuenta de Conductor
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dialog de confirmación para eliminar cuenta */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Eliminar Cuenta de Conductor
                </DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  tu cuenta de conductor, el historial de viajes y todos los
                  datos asociados.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteProfile}
                  disabled={isUpdatingProfile}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar definitivamente
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
