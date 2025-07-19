import React from "react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingDriverButtonProps {
  onClick: () => void;
}

export default function FloatingDriverButton({
  onClick,
}: FloatingDriverButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-full shadow-lg flex items-center space-x-2 hover:scale-105 transition-all duration-300"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
    >
      <Car className="w-6 h-6 mr-2" />
      ¡Conviértete en conductor!
    </button>
  );
}
