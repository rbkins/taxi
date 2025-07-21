"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTrip } from "@/contexts/TripContext";
import FloatingDriverButton from "@/components/auth/FloatingDriverButton";
import ConvertToDriverModal from "@/components/auth/ConvertToDriverModal";
import TripRequestForm from "@/components/trip/TripRequestForm";
import WaitingForResponseModal from "@/components/client/WaitingForResponseModal";
import MockMap from "@/components/map/MockMap";
import {
  Car,
  Home,
  History,
  UserIcon,
  MapPin,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Heart,
  Menu,
  X,
  Navigation,
  CreditCard,
  Settings,
  Bell,
  Calendar,
  Gift,
  Zap,
  ArrowRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Trip {
  id: string;
  date: string;
  origin: string;
  destination: string;
  status: "completed" | "cancelled";
  driver?: string;
  plate?: string;
  rating?: number;
  price?: string;
}

interface User {
  name: string;
  email: string;
  role?: string;
}

export default function ClientDashboard() {
  const { user: authUser, logout } = useAuth();
  const isMobile = useIsMobile();
  const {
    getTripNotifications,
    refreshTripNotifications,
    respondToOffer,
    currentTrip,
  } = useTrip();

  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [lastNotificationCheck, setLastNotificationCheck] = useState<Date>(
    new Date()
  );

  // Estados para manejo de viaje
  const [currentAcceptedTrip, setCurrentAcceptedTrip] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<
    "idle" | "accepted" | "in-progress" | "completed"
  >("idle");
  const [tripProgress, setTripProgress] = useState(0);
  const [showTripNotification, setShowTripNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );

  // Estados para el modal de espera de respuesta
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [waitingModalResponse, setWaitingModalResponse] = useState<
    "waiting" | "accepted" | "rejected" | null
  >(null);
  const [waitingStartTime, setWaitingStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [pendingTripData, setPendingTripData] = useState<any>(null);

  const [user, setUser] = useState<User>({
    name: authUser?.name || "Usuario",
    email: authUser?.email || "email@ejemplo.com",
    role: authUser?.role || "passenger",
  });

  // Estados para el formulario de viaje - REMOVIDO (ahora usa TripRequestForm)

  const [tripHistory] = useState<Trip[]>([
    {
      id: "001",
      date: "Hoy 14:30",
      origin: "Centro Comercial Plaza",
      destination: "Aeropuerto Internacional",
      status: "completed",
      driver: "Carlos Ruiz",
      plate: "ABC-123",
      rating: 5,
      price: "$25.00",
    },
    {
      id: "002",
      date: "Ayer 09:15",
      origin: "Universidad Nacional",
      destination: "Zona Rosa",
      status: "completed",
      driver: "María González",
      plate: "XYZ-789",
      rating: 4,
      price: "$15.00",
    },
  ]);

  // Cerrar menú móvil cuando se cambia a desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Contador de tiempo para el modal de espera
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (
      showWaitingModal &&
      waitingStartTime &&
      waitingModalResponse === "waiting"
    ) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - waitingStartTime.getTime()) / 1000
        );
        setTimeElapsed(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showWaitingModal, waitingStartTime, waitingModalResponse]);

  // Revisar notificaciones de ofertas
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        console.log("🔍 Cliente revisando notificaciones...");
        const notifications = await getTripNotifications();

        // Filtrar solo las notificaciones nuevas desde la última revisión
        const newNotifications = notifications.filter((notification) => {
          const notificationDate = new Date(notification.createdAt);
          return notificationDate > lastNotificationCheck;
        });

        console.log("📬 Notificaciones nuevas encontradas:", newNotifications);

        // Procesar notificaciones para mostrar al usuario
        newNotifications.forEach((notification) => {
          if (notification.type === "trip-accepted") {
            console.log("✅ Viaje aceptado:", notification.data?.driverName);

            // Actualizar modal de espera si está abierto
            if (showWaitingModal && waitingModalResponse === "waiting") {
              setWaitingModalResponse("accepted");
              // Ocultar modal después de 3 segundos para mostrar el viaje
              setTimeout(() => {
                setShowWaitingModal(false);
              }, 3000);
            }

            // Configurar el viaje aceptado con ubicaciones válidas por defecto
            setCurrentAcceptedTrip({
              id: notification.tripId,
              driverName: notification.data?.driverName || "Conductor",
              driverPhone: notification.data?.driverPhone || "N/A",
              vehiclePlate: notification.data?.vehiclePlate || "N/A",
              estimatedTime: notification.data?.estimatedTime || "5 min",
              origin: notification.data?.origin || {
                address: "Ubicación de origen",
                lat: 14.1,
                lng: -87.2,
              },
              destination: notification.data?.destination || {
                address: "Destino",
                lat: 14.12,
                lng: -87.18,
              },
              driverLocation: notification.data?.driverLocation || {
                address: "Ubicación del conductor",
                lat: 14.1,
                lng: -87.2,
              },
            });

            setTripStatus("accepted");
            setNotificationMessage(
              `¡Tu viaje ha sido aceptado por ${
                notification.data?.driverName || "el conductor"
              }!`
            );
            setNotificationType("success");
            setShowTripNotification(true);

            // Ocultar notificación después de 5 segundos
            setTimeout(() => setShowTripNotification(false), 5000);

            // Iniciar simulación del viaje después de 3 segundos
            setTimeout(() => {
              setTripStatus("in-progress");
              setTripProgress(0);
            }, 3000);
          } else if (notification.type === "trip-rejected") {
            console.log("❌ Viaje rechazado:", notification.data?.driverName);

            // Actualizar modal de espera si está abierto
            if (showWaitingModal && waitingModalResponse === "waiting") {
              setWaitingModalResponse("rejected");
              // Ocultar modal después de 5 segundos para permitir nueva búsqueda
              setTimeout(() => {
                setShowWaitingModal(false);
                setWaitingModalResponse(null);
                setPendingTripData(null);
              }, 5000);
            }

            setNotificationMessage(
              `${
                notification.data?.driverName || "El conductor"
              } no pudo aceptar tu solicitud. Intenta con otro conductor.`
            );
            setNotificationType("error");
            setShowTripNotification(true);

            // Ocultar notificación después de 5 segundos
            setTimeout(() => setShowTripNotification(false), 5000);
          }
        });

        if (newNotifications.length > 0) {
          setLastNotificationCheck(new Date());
        }
      } catch (error) {
        console.error("❌ Error al revisar notificaciones:", error);
      }
    };

    // Revisar notificaciones inmediatamente
    checkNotifications();

    // Configurar intervalo para revisar cada 3 segundos
    const interval = setInterval(checkNotifications, 3000);

    return () => clearInterval(interval);
  }, [getTripNotifications, lastNotificationCheck]);

  // Simulación del progreso del viaje
  useEffect(() => {
    if (tripStatus === "in-progress") {
      const interval = setInterval(() => {
        setTripProgress((prev) => {
          if (prev >= 100) {
            // Viaje completado
            setTripStatus("completed");
            setNotificationMessage(
              "¡Viaje completado! ¿Cómo calificas tu experiencia?"
            );
            setNotificationType("success");
            setShowTripNotification(true);

            // Después de 3 segundos, reset y ir al historial
            setTimeout(() => {
              setShowTripNotification(false);
              setCurrentAcceptedTrip(null);
              setTripStatus("idle");
              setTripProgress(0);
              setActiveTab("history"); // Cambiar a la pestaña de historial
            }, 3000);

            clearInterval(interval);
            return 100;
          }
          return prev + 2; // Incrementar 2% cada segundo (50 segundos total)
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tripStatus]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Función para manejar el cierre del modal de espera
  const handleCloseWaitingModal = () => {
    setShowWaitingModal(false);
    setWaitingModalResponse(null);
    setPendingTripData(null);
    setWaitingStartTime(null);
    setTimeElapsed(0);
  };

  // Sidebar Navigation
  const sidebarItems = [
    { id: "home", icon: Home, label: "Inicio" },
    { id: "history", icon: History, label: "Historial" },
    { id: "wallet", icon: CreditCard, label: "Billetera" },
    { id: "profile", icon: UserIcon, label: "Perfil" },
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
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-5 h-5 lg:w-6 lg:h-6 text-dark" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-taxi-yellow to-yellow-400 bg-clip-text text-transparent">
                Taxi Seguro
              </h1>
              <p className="text-xs text-gray-400">Tu compañero de viaje</p>
            </div>
          </div>

          {/* User Info Card */}
          <div className="mb-6 lg:mb-8 p-3 lg:p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-dark font-bold text-sm">
                  {user?.name?.[0] || "U"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm truncate">
                  {user?.name?.split(" ")[0] || "Usuario"}
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
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

          {/* Quick Stats */}
          <div className="p-3 lg:p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 mb-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-taxi-yellow">
                  {tripHistory.length}
                </p>
                <p className="text-xs text-gray-400">Viajes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-taxi-yellow">4.9</p>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 transition-all duration-300 text-sm lg:text-base"
          >
            Cerrar Sesión
          </Button>
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
                {activeTab === "home" && "Solicitar Viaje"}
                {activeTab === "history" && "Historial de Viajes"}
                {activeTab === "wallet" && "Mi Billetera"}
                {activeTab === "profile" && "Mi Perfil"}
              </h2>
              <p className="text-gray-600 hidden sm:block text-sm lg:text-base">
                {activeTab === "home" && "¿A dónde te llevamos hoy?"}
                {activeTab === "history" && "Revisa tus viajes anteriores"}
                {activeTab === "wallet" && "Gestiona tus métodos de pago"}
                {activeTab === "profile" && "Configuración de tu cuenta"}
              </p>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-dark">
                  ¡Hola, {user?.name?.split(" ")[0] || "Usuario"}!
                </p>
                <p className="text-xs text-gray-500">
                  Que tengas un buen viaje 🚗
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6">
          {/* Notificación flotante */}
          {showTripNotification && (
            <div
              className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
                notificationType === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : "bg-red-50 border-red-500 text-red-800"
              } animate-fade-in max-w-sm`}
            >
              <div className="flex items-center">
                {notificationType === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <X className="w-5 h-5 mr-2" />
                )}
                <p className="font-medium">{notificationMessage}</p>
              </div>
            </div>
          )}

          {/* Viaje en progreso */}
          {(tripStatus === "accepted" || tripStatus === "in-progress") &&
            currentAcceptedTrip && (
              <div className="space-y-4 lg:space-y-6 mb-6">
                <Card className="bg-gradient-to-r from-taxi-yellow/10 to-yellow-50 border-taxi-yellow shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-dark flex items-center space-x-2">
                      <Car className="w-6 h-6 text-taxi-yellow" />
                      <span>
                        {tripStatus === "accepted"
                          ? "Viaje Aceptado"
                          : "Viaje en Progreso"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-dark text-lg">
                          {currentAcceptedTrip.driverName}
                        </h3>
                        <p className="text-gray-600">
                          {currentAcceptedTrip.vehiclePlate} • ETA:{" "}
                          {currentAcceptedTrip.estimatedTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-success text-white">
                          {tripStatus === "accepted"
                            ? "Conductor en camino"
                            : "En ruta"}
                        </Badge>
                      </div>
                    </div>

                    {tripStatus === "in-progress" && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progreso del viaje</span>
                          <span>{tripProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-taxi-yellow to-yellow-400 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${tripProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Mini mapa */}
                    <div className="h-48 rounded-lg overflow-hidden border">
                      <MockMap
                        origin={currentAcceptedTrip.origin}
                        destination={currentAcceptedTrip.destination}
                        drivers={[
                          {
                            id: currentAcceptedTrip.id,
                            name: currentAcceptedTrip.driverName,
                            currentLocation:
                              currentAcceptedTrip.driverLocation ||
                              currentAcceptedTrip.origin,
                          },
                        ]}
                        selectedDriver={currentAcceptedTrip.id}
                        showRoute={true}
                        className="w-full h-full"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-taxi-yellow text-taxi-yellow hover:bg-taxi-yellow hover:text-dark"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar Conductor
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Compartir Ubicación
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          {/* Home Tab - Solicitar Viaje (solo mostrar si no hay viaje en progreso) */}
          {activeTab === "home" && tripStatus === "idle" && (
            <TripRequestForm
              onTripRequested={(tripId) => {
                console.log("Trip requested:", tripId);
              }}
              onTripOfferSent={(tripData) => {
                console.log("Trip offer sent:", tripData);
                // Mostrar modal de espera
                setPendingTripData(tripData);
                setWaitingModalResponse("waiting");
                setWaitingStartTime(new Date());
                setTimeElapsed(0);
                setShowWaitingModal(true);
              }}
            />
          )}

          {/* Mensaje cuando hay viaje en progreso */}
          {activeTab === "home" &&
            tripStatus !== "idle" &&
            tripStatus !== "completed" && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <Car className="w-12 h-12 mx-auto mb-4 text-taxi-yellow" />
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {tripStatus === "accepted"
                      ? "Conductor en camino"
                      : "Viaje en progreso"}
                  </h3>
                  <p className="text-gray-600">
                    {tripStatus === "accepted"
                      ? "Tu conductor está en camino. Te notificaremos cuando llegue."
                      : "Estás en camino a tu destino. Disfruta el viaje."}
                  </p>
                </CardContent>
              </Card>
            )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-dark">Tus viajes</h3>
                  <p className="text-gray-600">
                    {tripHistory.length} viajes realizados
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark">
                  Total: $40.00
                </Badge>
              </div>

              {tripHistory.map((trip) => (
                <Card key={trip.id} className="bg-white shadow-lg border-0">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-dark font-bold text-sm">
                            #{trip.id}
                          </span>
                        </div>
                        <div>
                          <Badge className="bg-success text-white mb-1">
                            Completado
                          </Badge>
                          <p className="text-sm text-gray-500">{trip.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-dark">
                          {trip.price}
                        </p>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          {[...Array(trip.rating || 0)].map((_, i) => (
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
                        <p className="font-medium text-dark">{trip.origin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Destino</p>
                        <p className="font-medium text-dark">
                          {trip.destination}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-taxi-yellow"
                      >
                        Ver detalles
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-4 lg:space-y-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-dark">Mi Billetera</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Próximamente: Gestión de métodos de pago
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
                  <CardTitle className="text-dark">Mi Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                      <UserIcon className="w-10 h-10 text-dark" />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark text-lg">
                        {user?.name || "Usuario"}
                      </h3>
                      <p className="text-gray-600">
                        {user?.email || "Email no disponible"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Viajes",
                        value: tripHistory.length.toString(),
                        icon: Car,
                      },
                      { label: "Puntos", value: "1,247", icon: Star },
                      { label: "Ahorrado", value: "$156", icon: TrendingUp },
                    ].map((stat, index) => (
                      <Card
                        key={index}
                        className="bg-gray-50 border-0 text-center p-3"
                      >
                        <stat.icon className="w-6 h-6 mx-auto mb-2 text-taxi-yellow" />
                        <p className="text-lg font-bold text-dark">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-600">{stat.label}</p>
                      </Card>
                    ))}
                  </div>

                  <Button className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark font-semibold py-3">
                    <Settings className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Floating Driver Button */}
      {user?.role !== "conductor" && activeTab === "profile" && (
        <>
          <FloatingDriverButton onClick={() => setShowConvertModal(true)} />
          <ConvertToDriverModal
            open={showConvertModal}
            onClose={() => setShowConvertModal(false)}
            onSuccess={() => {
              setUser((prev) => ({ ...prev, role: "conductor" }));
            }}
          />
        </>
      )}

      {/* Modal de espera de respuesta */}
      {pendingTripData && (
        <WaitingForResponseModal
          isOpen={showWaitingModal}
          onClose={handleCloseWaitingModal}
          tripData={{
            origin: pendingTripData.origin,
            destination: pendingTripData.destination,
            proposedFare: pendingTripData.proposedFare,
            distance: pendingTripData.distance,
            estimatedTime: pendingTripData.estimatedTime,
          }}
          responseStatus={waitingModalResponse}
          timeElapsed={timeElapsed}
        />
      )}
    </div>
  );
}
