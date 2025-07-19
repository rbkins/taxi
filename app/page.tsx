"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DriverDashboard from "@/components/driver/DriverDashboard";
import {
  Car,
  Home,
  History,
  UserIcon,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Play,
  Phone,
  Mail,
  Award,
  TrendingUp,
  Heart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingDriverButton from "@/components/auth/FloatingDriverButton";
import ConvertToDriverModal from "@/components/auth/ConvertToDriverModal";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Tipos de datos
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

interface Driver {
  name: string;
  plate: string;
  photo: string;
  rating: number;
  trips: number;
}

interface User {
  name: string;
  email: string;
  role?: string;
}

interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  avatar: string;
}

export default function TaxiSeguroApp() {
  // Hook de autenticación
  const { user: authUser, login, register, logout, loading } = useAuth();

  // Estados principales
  const [currentScreen, setCurrentScreen] = useState<
    "landing" | "auth" | "main"
  >("landing");
  const [activeTab, setActiveTab] = useState<"home" | "history" | "profile">(
    "home"
  );
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Estados del viaje
  const [tripStatus, setTripStatus] = useState<
    "idle" | "searching" | "found" | "inProgress"
  >("idle");
  const [currentTrip, setCurrentTrip] = useState<Driver | null>(null);
  const [tripProgress, setTripProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Estados de animación
  const [typingText, setTypingText] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [statsAnimation, setStatsAnimation] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    currentLocation: "Mi ubicación actual",
    destination: "",
    tripType: "economico",
  });

  // Datos simulados
  const [user, setUser] = useState<User>({
    name: "Juan Pérez",
    email: "juan@email.com",
    role: "passenger",
  });
  const [showConvertModal, setShowConvertModal] = useState(false);

  const testimonials: Testimonial[] = [
    {
      name: "María González",
      rating: 5,
      comment:
        "¡Increíble servicio! Siempre llegan a tiempo y los conductores son muy amables.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    {
      name: "Carlos Rodríguez",
      rating: 5,
      comment:
        "La app más confiable para moverse por la ciudad. 100% recomendada.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    {
      name: "Ana Martínez",
      rating: 5,
      comment: "Seguridad y rapidez en cada viaje. No uso otra app de taxis.",
      avatar: "/placeholder.svg?height=50&width=50",
    },
  ];

  const [tripHistory] = useState<Trip[]>([
    {
      id: "1",
      date: "2024-01-15",
      origin: "Centro Comercial Plaza Norte",
      destination: "Aeropuerto Internacional Jorge Chávez",
      status: "completed",
      driver: "Carlos Mendoza",
      plate: "ABC-123",
      rating: 5,
      price: "$25.50",
    },
    {
      id: "2",
      date: "2024-01-14",
      origin: "Hotel Plaza San Martín",
      destination: "Estación Central de Buses",
      status: "cancelled",
      price: "$12.00",
    },
    {
      id: "3",
      date: "2024-01-13",
      origin: "Universidad Nacional Mayor",
      destination: "Centro Histórico de Lima",
      status: "completed",
      driver: "María González",
      plate: "XYZ-789",
      rating: 5,
      price: "$18.75",
    },
  ]);

  const mockDrivers: Driver[] = [
    {
      name: "Carlos Mendoza",
      plate: "ABC-123",
      photo: "/placeholder.svg?height=60&width=60",
      rating: 4.9,
      trips: 1247,
    },
    {
      name: "María González",
      plate: "XYZ-789",
      photo: "/placeholder.svg?height=60&width=60",
      rating: 4.8,
      trips: 892,
    },
    {
      name: "Roberto Silva",
      plate: "DEF-456",
      photo: "/placeholder.svg?height=60&width=60",
      rating: 4.9,
      trips: 1156,
    },
  ];

  const heroTexts = [
    "Tu viaje, seguro y rápido",
    "Conectamos destinos, creamos experiencias",
    "La revolución del transporte urbano",
  ];

  // Efectos
  useEffect(() => {
    if (currentScreen === "landing") {
      let currentTextIndex = 0;
      let currentCharIndex = 0;
      const typeText = () => {
        if (currentCharIndex < heroTexts[currentTextIndex].length) {
          setTypingText(
            heroTexts[currentTextIndex].substring(0, currentCharIndex + 1)
          );
          currentCharIndex++;
          setTimeout(typeText, 100);
        } else {
          setTimeout(() => {
            currentTextIndex = (currentTextIndex + 1) % heroTexts.length;
            currentCharIndex = 0;
            setTypingText("");
            setTimeout(typeText, 500);
          }, 2000);
        }
      };
      typeText();
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === "landing") {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === "landing") {
      setTimeout(() => setStatsAnimation(true), 1000);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (tripStatus === "searching") {
      const timer = setTimeout(() => {
        const randomDriver =
          mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
        setCurrentTrip(randomDriver);
        setTripStatus("found");
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tripStatus]);

  useEffect(() => {
    if (tripStatus === "inProgress") {
      const interval = setInterval(() => {
        setTripProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
            return 100;
          }
          return prev + 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tripStatus]);

  // Efecto para manejar autenticación
  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser?.name || "Usuario",
        email: authUser?.email || "Email no disponible",
        role: authUser?.role || "passenger",
      });
      setIsAuthenticated(true);
      if (currentScreen === "auth") {
        setCurrentScreen("main");
      }
    } else {
      setIsAuthenticated(false);
      if (currentScreen === "main") {
        setCurrentScreen("landing");
      }
    }
  }, [authUser, currentScreen]);

  // Funciones de manejo
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuth = async () => {
    setAuthError("");

    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setAuthError("Todos los campos son obligatorios");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAuthError("Por favor ingresa un email válido");
      return;
    }

    // Validar contraseña
    if (formData.password.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      if (authMode === "register") {
        // Validaciones adicionales para registro
        if (!formData.name.trim()) {
          setAuthError("El nombre es obligatorio");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setAuthError("Las contraseñas no coinciden");
          return;
        }

        // Datos para registro
        const registerData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: "+1234567890", // Valor por defecto
          role: "passenger" as const,
          emergencyContact: {
            name: "Contacto de emergencia",
            phone: "+0987654321",
          },
        };

        const result = await register(registerData);

        if (result.success) {
          setUser({ name: formData.name, email: formData.email });
          setIsAuthenticated(true);
          setCurrentScreen("main");
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        } else {
          setAuthError(result.message);
        }
      } else {
        // Login
        const result = await login(formData.email, formData.password);

        if (result.success) {
          setUser({
            name: authUser?.name || formData.email,
            email: formData.email,
          });
          setIsAuthenticated(true);
          setCurrentScreen("main");
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        } else {
          // Mostrar mensaje específico según el error
          if (result.message.includes("Credenciales inválidas")) {
            setAuthError(
              "Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente."
            );
          } else if (result.message.includes("desactivada")) {
            setAuthError(
              "Tu cuenta ha sido desactivada. Contacta al administrador."
            );
          } else if (result.message.includes("no encontrado")) {
            setAuthError(
              "No existe una cuenta con este email. ¿Deseas registrarte?"
            );
          } else {
            setAuthError(result.message);
          }
        }
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
      setAuthError(
        "Error de conexión. Verifica tu internet e intenta nuevamente."
      );
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentScreen("landing");
    setUser({ name: "", email: "" });
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      currentLocation: "Mi ubicación actual",
      destination: "",
      tripType: "economico",
    });
    setAuthError("");
  };

  const handleRequestTaxi = () => {
    if (!formData.destination.trim()) {
      alert("Por favor ingresa un destino");
      return;
    }
    setTripStatus("searching");
  };

  const handleStartTrip = () => {
    setTripStatus("inProgress");
    setTripProgress(0);
  };

  const handleFinishTrip = () => {
    setTripStatus("idle");
    setCurrentTrip(null);
    setTripProgress(0);
    setFormData((prev) => ({ ...prev, destination: "" }));
  };

  const handleCancelTrip = () => {
    setTripStatus("idle");
    setCurrentTrip(null);
    setTripProgress(0);
  };

  // Componente de partículas flotantes
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-taxi-yellow/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );

  // Componente de celebración
  const Celebration = () =>
    showCelebration && (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        <div className="animate-bounce">
          <Sparkles className="w-16 h-16 text-taxi-yellow animate-spin" />
        </div>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-taxi-yellow rounded-full animate-ping"
            style={{
              left: `${45 + Math.random() * 10}%`,
              top: `${45 + Math.random() * 10}%`,
              animationDelay: `${Math.random() * 1}s`,
            }}
          />
        ))}
      </div>
    );

  // Landing Page
  if (currentScreen === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark text-white overflow-hidden relative">
        <FloatingParticles />
        <Celebration />

        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-dark" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-taxi-yellow to-yellow-400 bg-clip-text text-transparent">
              Taxi Seguro
            </h1>
          </div>
          <Button
            onClick={() => setCurrentScreen("auth")}
            className="bg-transparent border-2 border-taxi-yellow text-taxi-yellow hover:bg-taxi-yellow hover:text-dark transition-all duration-300 transform hover:scale-105"
          >
            Iniciar Sesión
          </Button>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-taxi-yellow to-white bg-clip-text text-transparent animate-pulse">
                Taxi Seguro
              </h2>
              <div className="h-16 flex items-center justify-center">
                <p className="text-2xl md:text-3xl text-gray-300 font-light">
                  {typingText}
                  <span className="animate-blink">|</span>
                </p>
              </div>
            </div>

            <div className="mb-12">
              <Button
                onClick={() => setCurrentScreen("auth")}
                className="bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark font-bold px-12 py-4 text-xl rounded-full shadow-2xl hover:shadow-taxi-yellow/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2"
              >
                <Play className="w-6 h-6 mr-3" />
                Comenzar Ahora
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { number: "50K+", label: "Usuarios Activos", icon: Users },
                { number: "99.9%", label: "Confiabilidad", icon: Shield },
                { number: "4.9★", label: "Calificación", icon: Star },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center transform hover:scale-110 transition-all duration-300"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-taxi-yellow" />
                  <div
                    className={`text-3xl font-bold text-taxi-yellow mb-2 ${
                      statsAnimation ? "animate-bounce" : ""
                    }`}
                  >
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative z-10 px-6 py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-taxi-yellow to-yellow-400 bg-clip-text text-transparent">
              ¿Por qué elegir Taxi Seguro?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Súper Rápido",
                  description: "Encuentra tu taxi en menos de 2 minutos",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Shield,
                  title: "100% Seguro",
                  description:
                    "Conductores verificados y seguimiento en tiempo real",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: Award,
                  title: "Mejor Precio",
                  description: "Tarifas justas y transparentes sin sorpresas",
                  color: "from-purple-500 to-pink-500",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center group-hover:animate-bounce`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-white">
                      {feature.title}
                    </h4>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold mb-16 bg-gradient-to-r from-taxi-yellow to-yellow-400 bg-clip-text text-transparent">
              Lo que dicen nuestros usuarios
            </h3>
            <div className="relative h-48">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === currentTestimonial
                      ? "opacity-100 transform translate-y-0"
                      : "opacity-0 transform translate-y-4"
                  }`}
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
                    <CardContent className="p-8">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-taxi-yellow fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-lg text-gray-300 mb-6 italic">
                        "{testimonial.comment}"
                      </p>
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-dark font-bold">
                            {testimonial.name[0]}
                          </span>
                        </div>
                        <span className="text-white font-semibold">
                          {testimonial.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-taxi-yellow scale-125"
                      : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-taxi-yellow/20 to-yellow-400/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-5xl font-bold mb-6 text-white">
              ¿Listo para la mejor experiencia de transporte?
            </h3>
            <p className="text-xl text-gray-300 mb-12">
              Únete a miles de usuarios que ya confían en Taxi Seguro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setCurrentScreen("auth")}
                className="bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark font-bold px-12 py-4 text-xl rounded-full shadow-2xl hover:shadow-taxi-yellow/50 transition-all duration-300 transform hover:scale-110"
              >
                <ArrowRight className="w-6 h-6 mr-3" />
                Empezar Gratis
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-dark px-12 py-4 text-xl rounded-full transition-all duration-300 transform hover:scale-105 bg-transparent"
              >
                <Phone className="w-6 h-6 mr-3" />
                Contactar
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 px-6 py-12 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-dark" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Taxi Seguro</h4>
                </div>
                <p className="text-gray-400">
                  La revolución del transporte urbano a tu alcance.
                </p>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-4">Servicios</h5>
                <ul className="space-y-2 text-gray-400">
                  <li>Taxi Económico</li>
                  <li>Taxi Ejecutivo</li>
                  <li>Viajes Programados</li>
                  <li>Corporativo</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-4">Soporte</h5>
                <ul className="space-y-2 text-gray-400">
                  <li>Centro de Ayuda</li>
                  <li>Contacto</li>
                  <li>Términos</li>
                  <li>Privacidad</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-4">Contacto</h5>
                <div className="space-y-2 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>info@taxiseguro.com</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Taxi Seguro. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Pantalla de Autenticación
  if (currentScreen === "auth") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark text-white relative overflow-hidden">
        <FloatingParticles />
        <Celebration />

        <div className="relative z-10 p-6">
          <div className="max-w-md mx-auto pt-12">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse">
                <Car className="w-12 h-12 text-dark" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-taxi-yellow to-yellow-400 bg-clip-text text-transparent">
                Taxi Seguro
              </h1>
              <p className="text-gray-400 mt-2">
                Tu viaje seguro comienza aquí
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <Tabs
                  value={authMode}
                  onValueChange={(value) =>
                    setAuthMode(value as "login" | "register")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-taxi-yellow data-[state=active]:text-dark text-white transition-all duration-300"
                    >
                      Iniciar Sesión
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="data-[state=active]:bg-taxi-yellow data-[state=active]:text-dark text-white transition-all duration-300"
                    >
                      Registrarse
                    </TabsTrigger>
                  </TabsList>

                  {authError && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                      {authError}
                    </div>
                  )}

                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Correo electrónico
                      </label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-taxi-yellow transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Contraseña
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-taxi-yellow transition-all duration-300"
                      />
                    </div>
                    <Button
                      onClick={handleAuth}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark font-semibold py-3 rounded-lg shadow-lg hover:shadow-taxi-yellow/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                    <button
                      onClick={() => setShowForgotPassword(true)}
                      className="w-full text-center text-gray-400 hover:text-taxi-yellow text-sm transition-colors duration-300"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Nombre completo
                      </label>
                      <Input
                        type="text"
                        placeholder="Tu nombre completo"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-taxi-yellow transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Correo electrónico
                      </label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-taxi-yellow transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Contraseña
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-taxi-yellow transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Confirmar contraseña
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-taxi-yellow transition-all duration-300"
                      />
                    </div>
                    <Button
                      onClick={handleAuth}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark font-semibold py-3 rounded-lg shadow-lg hover:shadow-taxi-yellow/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? "Creando cuenta..." : "Crear Cuenta"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentScreen("landing")}
                className="text-gray-400 hover:text-taxi-yellow transition-colors duration-300"
              >
                ← Volver al inicio
              </button>
            </div>
          </div>
        </div>

        {/* Modal de recuperación de contraseña */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-full max-w-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recuperar Contraseña
                </h3>
                <p className="text-gray-400 mb-6">
                  Esta funcionalidad estará disponible próximamente.
                </p>
                <Button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark font-semibold"
                >
                  Entendido
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Verificar si el usuario es conductor
  if (isAuthenticated && user?.role === "conductor") {
    return <DriverDashboard />;
  }

  // Aplicación Principal (Cliente)
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gray to-gray-100 relative">
      <Celebration />
      {/* Botón flotante para convertir a conductor */}
      {user?.role !== "conductor" && (
        <>
          {activeTab === "profile" && (
            <FloatingDriverButton onClick={() => setShowConvertModal(true)} />
          )}
          <ConvertToDriverModal
            open={showConvertModal}
            onClose={() => setShowConvertModal(false)}
            onSuccess={() => {
              setUser((prev) => ({ ...prev, role: "conductor" }));
            }}
          />
        </>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-dark to-gray-800 text-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Car className="w-5 h-5 text-dark" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-taxi-yellow to-yellow-400 bg-clip-text text-transparent">
                Taxi Seguro
              </h1>
              <p className="text-xs text-gray-400">Tu compañero de viaje</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Hola, {user?.name?.split(" ")[0] || "Usuario"} 👋
            </div>
            <div className="text-xs text-gray-400 flex items-center">
              <Heart className="w-3 h-3 mr-1 text-red-500" />
              Usuario Premium
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="pb-24 px-4">
        {/* Pantalla de Inicio */}
        {activeTab === "home" && (
          <div className="space-y-6 pt-6">
            <Card className="bg-gradient-to-r from-white to-gray-50 shadow-2xl border-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-taxi-yellow/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="relative">
                <CardTitle className="text-dark flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-taxi-yellow" />
                  <span>Solicitar Viaje</span>
                </CardTitle>
                <p className="text-gray-600">¿A dónde te llevamos hoy?</p>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark flex items-center space-x-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span>Ubicación actual</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-success" />
                      <Input
                        value={formData.currentLocation}
                        onChange={(e) =>
                          handleInputChange("currentLocation", e.target.value)
                        }
                        className="pl-10 bg-white border-gray-200 focus:border-taxi-yellow focus:ring-taxi-yellow/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark flex items-center space-x-2">
                      <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
                      <span>Destino</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-error" />
                      <Input
                        placeholder="¿A dónde quieres ir?"
                        value={formData.destination}
                        onChange={(e) =>
                          handleInputChange("destination", e.target.value)
                        }
                        className="pl-10 bg-white border-gray-200 focus:border-taxi-yellow focus:ring-taxi-yellow/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-dark">
                      Tipo de viaje
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={
                          formData.tripType === "economico"
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleInputChange("tripType", "economico")
                        }
                        className={`h-16 flex flex-col space-y-1 transition-all duration-300 transform hover:scale-105 ${
                          formData.tripType === "economico"
                            ? "bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark shadow-lg"
                            : "border-gray-200 hover:border-taxi-yellow"
                        }`}
                      >
                        <Car className="w-5 h-5" />
                        <span className="text-sm font-medium">Económico</span>
                        <span className="text-xs opacity-70">Desde $5.00</span>
                      </Button>
                      <Button
                        variant={
                          formData.tripType === "ejecutivo"
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleInputChange("tripType", "ejecutivo")
                        }
                        className={`h-16 flex flex-col space-y-1 transition-all duration-300 transform hover:scale-105 ${
                          formData.tripType === "ejecutivo"
                            ? "bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark shadow-lg"
                            : "border-gray-200 hover:border-taxi-yellow"
                        }`}
                      >
                        <Award className="w-5 h-5" />
                        <span className="text-sm font-medium">Ejecutivo</span>
                        <span className="text-xs opacity-70">Desde $12.00</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {tripStatus === "idle" && (
                  <Button
                    onClick={handleRequestTaxi}
                    className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 hover:from-yellow-400 hover:to-taxi-yellow text-dark font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-taxi-yellow/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Solicitar Taxi Ahora
                  </Button>
                )}

                {tripStatus === "searching" && (
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                            <Car className="w-10 h-10 text-white animate-bounce" />
                          </div>
                          <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-blue-300 rounded-full animate-ping"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-dark text-lg">
                            Buscando conductor...
                          </h3>
                          <p className="text-gray-600">
                            Conectando con conductores cercanos
                          </p>
                        </div>
                        <div className="flex justify-center space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {tripStatus === "found" && currentTrip && (
                  <Card className="bg-gradient-to-r from-success/10 to-emerald-50 border-success shadow-lg">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <CheckCircle className="w-16 h-16 text-success mx-auto animate-bounce" />
                          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-success/30 rounded-full animate-ping"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-dark text-xl">
                            ¡Conductor encontrado!
                          </h3>
                          <p className="text-gray-600">
                            Tu conductor está en camino
                          </p>
                        </div>
                        <Card className="bg-white/80 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-dark font-bold text-lg">
                                  {currentTrip.name[0]}
                                </span>
                              </div>
                              <div className="flex-1 text-left">
                                <h4 className="font-semibold text-dark">
                                  {currentTrip.name}
                                </h4>
                                <p className="text-gray-600">
                                  Placa: {currentTrip.plate}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < Math.floor(currentTrip.rating)
                                            ? "text-taxi-yellow fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {currentTrip.rating} • {currentTrip.trips}{" "}
                                    viajes
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={handleStartTrip}
                            className="bg-gradient-to-r from-success to-emerald-500 hover:from-emerald-500 hover:to-success text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar Viaje
                          </Button>
                          <Button
                            onClick={handleCancelTrip}
                            variant="outline"
                            className="border-2 border-error text-error hover:bg-error hover:text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-transparent"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {tripStatus === "inProgress" && (
                  <Card className="bg-gradient-to-r from-taxi-yellow/10 to-yellow-50 border-taxi-yellow shadow-lg">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <Clock className="w-16 h-16 text-taxi-yellow mx-auto animate-pulse" />
                          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-taxi-yellow/30 rounded-full animate-spin"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-dark text-xl">
                            Viaje en curso
                          </h3>
                          <p className="text-gray-600">
                            Conductor: {currentTrip?.name}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Progreso del viaje</span>
                            <span>{tripProgress}%</span>
                          </div>
                          <Progress
                            value={tripProgress}
                            className="h-3 bg-gray-200"
                          >
                            <div
                              className="h-full bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${tripProgress}%` }}
                            />
                          </Progress>
                          <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
                            <div
                              className={`text-center ${
                                tripProgress >= 25
                                  ? "text-success font-semibold"
                                  : ""
                              }`}
                            >
                              Recogida
                            </div>
                            <div
                              className={`text-center ${
                                tripProgress >= 50
                                  ? "text-success font-semibold"
                                  : ""
                              }`}
                            >
                              En ruta
                            </div>
                            <div
                              className={`text-center ${
                                tripProgress >= 75
                                  ? "text-success font-semibold"
                                  : ""
                              }`}
                            >
                              Cerca
                            </div>
                            <div
                              className={`text-center ${
                                tripProgress >= 100
                                  ? "text-success font-semibold"
                                  : ""
                              }`}
                            >
                              Llegada
                            </div>
                          </div>
                        </div>
                        {tripProgress >= 100 ? (
                          <Button
                            onClick={handleFinishTrip}
                            className="w-full bg-gradient-to-r from-success to-emerald-500 hover:from-emerald-500 hover:to-success text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Finalizar Viaje
                          </Button>
                        ) : (
                          <Button
                            onClick={handleCancelTrip}
                            variant="outline"
                            className="w-full border-2 border-error text-error hover:bg-error hover:text-white py-3 rounded-lg transition-all duration-300 bg-transparent"
                          >
                            Cancelar Viaje
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pantalla de Historial */}
        {activeTab === "history" && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark">
                Historial de Viajes
              </h2>
              <Badge className="bg-gradient-to-r from-taxi-yellow to-yellow-400 text-dark">
                {tripHistory.length} viajes
              </Badge>
            </div>
            {tripHistory.map((trip, index) => (
              <Card
                key={trip.id}
                className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-taxi-yellow/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-dark font-bold">#{trip.id}</span>
                      </div>
                      <div>
                        <Badge
                          variant={
                            trip.status === "completed"
                              ? "default"
                              : "destructive"
                          }
                          className={`${
                            trip.status === "completed"
                              ? "bg-success hover:bg-success"
                              : "bg-error hover:bg-error"
                          } text-white`}
                        >
                          {trip.status === "completed"
                            ? "Completado"
                            : "Cancelado"}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {trip.date}
                        </p>
                      </div>
                    </div>
                    {trip.price && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-dark">
                          {trip.price}
                        </p>
                        {trip.rating && (
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            {[...Array(trip.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 text-taxi-yellow fill-current"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center space-y-2 mt-1">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <div className="w-0.5 h-8 bg-gray-300"></div>
                        <div className="w-3 h-3 bg-error rounded-full"></div>
                      </div>
                      <div className="flex-1 space-y-4">
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
                    </div>

                    {trip.driver && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-dark font-bold text-sm">
                              {trip.driver[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark">
                              {trip.driver}
                            </p>
                            <p className="text-xs text-gray-500">
                              Placa: {trip.plate}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-taxi-yellow hover:text-yellow-600 hover:bg-taxi-yellow/10 transition-all duration-300"
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

        {/* Pantalla de Perfil */}
        {activeTab === "profile" && (
          <div className="space-y-6 pt-6">
            <Card className="bg-gradient-to-r from-white to-gray-50 shadow-2xl border-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-taxi-yellow/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="relative">
                <CardTitle className="text-dark">Mi Perfil</CardTitle>
                <p className="text-gray-600">
                  Gestiona tu información personal
                </p>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-taxi-yellow to-yellow-400 rounded-full flex items-center justify-center shadow-2xl">
                      <UserIcon className="w-12 h-12 text-dark" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark text-xl">
                      {user?.name || "Usuario"}
                    </h3>
                    <p className="text-gray-600">
                      {user?.email || "Email no disponible"}
                    </p>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mt-2">
                      <Award className="w-3 h-3 mr-1" />
                      Usuario Premium
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Viajes",
                      value: "23",
                      icon: Car,
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      label: "Puntos",
                      value: "1,247",
                      icon: Star,
                      color: "from-yellow-500 to-orange-500",
                    },
                    {
                      label: "Ahorrado",
                      value: "$156",
                      icon: TrendingUp,
                      color: "from-green-500 to-emerald-500",
                    },
                  ].map((stat, index) => (
                    <Card
                      key={index}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center`}
                        >
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-dark">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-600">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-taxi-yellow to-yellow-400 hover:from-yellow-400 hover:to-taxi-yellow text-dark font-semibold py-4 rounded-xl shadow-lg hover:shadow-taxi-yellow/50 transition-all duration-300 transform hover:scale-105"
                    onClick={() => alert("Funcionalidad en desarrollo")}
                  >
                    <UserIcon className="w-5 h-5 mr-2" />
                    Editar Perfil
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-error to-red-600 hover:from-red-600 hover:to-error text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-error/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-dark to-gray-800 text-white border-t border-gray-700 shadow-2xl">
        <div className="flex">
          {[
            { id: "home", icon: Home, label: "Inicio" },
            { id: "history", icon: History, label: "Historial" },
            { id: "profile", icon: UserIcon, label: "Perfil" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 px-4 text-center transition-all duration-300 transform ${
                activeTab === tab.id
                  ? "text-taxi-yellow scale-110 -translate-y-1"
                  : "text-white/70 hover:text-white hover:scale-105"
              }`}
            >
              <tab.icon
                className={`w-6 h-6 mx-auto mb-1 ${
                  activeTab === tab.id ? "animate-bounce" : ""
                }`}
              />
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-taxi-yellow rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
