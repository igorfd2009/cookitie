import { useState } from 'react';
import { Button } from "./ui/button";
import { Eye, X } from "lucide-react";

export function AdminPanel() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-cookite-blue hover:bg-cookite-blue-hover text-gray-800 rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <Eye size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Painel Admin</h2>
          <Button
            onClick={() => setIsVisible(false)}
            variant="outline"
            size="sm"
          >
            <X size={16} />
          </Button>
        </div>
        <p>Painel administrativo em desenvolvimento.</p>
      </div>
    </div>
  );
}