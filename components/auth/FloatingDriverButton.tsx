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
      className="fixed bottom-24 right-4 lg:right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 lg:py-4 px-4 lg:px-6 rounded-full shadow-lg flex items-center justify-center space-x-1 lg:space-x-2 hover:scale-105 transition-all duration-300 min-w-[56px] lg:min-w-auto"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
    >
      <Car className="w-5 h-5 lg:w-6 lg:h-6 lg:mr-2" />
      <span className="hidden sm:inline text-sm lg:text-base whitespace-nowrap">
        ¡Conviértete en conductor!
      </span>
      <span className="sm:hidden text-xs">Conductor</span>
    </button>
  );
}
