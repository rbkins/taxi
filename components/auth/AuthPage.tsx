"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // Si el usuario ya está autenticado, redirigir al dashboard
  React.useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleAuthSuccess = () => {
    // Redirigir al dashboard después de autenticación exitosa
    router.push("/dashboard");
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {isLogin ? (
          <LoginForm
            onToggleForm={handleToggleForm}
            onSuccess={handleAuthSuccess}
          />
        ) : (
          <RegisterForm
            onToggleForm={handleToggleForm}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
}
