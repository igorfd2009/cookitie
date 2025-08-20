import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Eye, X, Users, DollarSign, Package, TrendingUp, Search, RefreshCw, Phone, Calendar } from "lucide-react";
import { useReservations } from "../hooks/useReservations";
import { toast } from "sonner";

interface ReservationItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

interface Reservation {
  id: string;
  customer: Customer;
  items: ReservationItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
}

interface Stats {
  totalReservations: number;
  totalRevenue: number;
  totalItems: number;
}

export function AdminDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAllReservations, getStats, isLoading } = useReservations();

  const loadData = async () => {
    try {
      const reservationsResult = await getAllReservations();
      if (reservationsResult.success) {
        const reservationsData = reservationsResult.data || [];
        setReservations(reservationsData);
        setFilteredReservations(reservationsData);
      } else {
        toast.error("Erro ao carregar reservas");
      }

      const statsResult = await getStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        toast.error("Erro ao carregar estatísticas");
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error("Erro ao carregar dados administrativos");
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  useEffect(() => {
    let filtered = reservations;
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customer.phone.includes(searchTerm) ||
        reservation.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredReservations(filtered);
  }, [searchTerm, reservations]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue-hover)] text-gray-800 rounded-full w-14 h-14 p-0 shadow-lg animate-pulse-glow"
          title="Painel Administrativo"
        >
          <Eye size={24} />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[var(--color-cookite-blue)] to-[var(--color-cookite-yellow)]">
          <div>
            <h2 className="text-2xl text-gray-800 mb-1">Painel Administrativo</h2>
            <p className="text-sm text-gray-600">Cookite - JEPP 2025</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="bg-white border-gray-300"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="outline"
              size="sm"
              className="bg-white border-gray-300"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-100px)] p-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-cookite-blue)] rounded-xl flex items-center justify-center">
                      <Users className="text-gray-800" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl text-gray-800">{stats.totalReservations}</p>
                      <p className="text-sm text-gray-600">Total de Reservas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-cookite-yellow)] rounded-xl flex items-center justify-center">
                      <DollarSign className="text-gray-800" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-sm text-gray-600">Receita Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-cookite-blue)] rounded-xl flex items-center justify-center">
                      <Package className="text-gray-800" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl text-gray-800">{stats.totalItems}</p>
                      <p className="text-sm text-gray-600">Itens Vendidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--color-cookite-yellow)] rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-gray-800" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl text-gray-800">
                        {stats.totalReservations > 0 ? formatCurrency(stats.totalRevenue / stats.totalReservations) : 'R$ 0'}
                      </p>
                      <p className="text-sm text-gray-600">Ticket Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, telefone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--color-cookite-blue)] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando reservas...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-2">Nenhuma reserva encontrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {filteredReservations.length} reserva{filteredReservations.length !== 1 ? 's' : ''} encontrada{filteredReservations.length !== 1 ? 's' : ''}
              </p>
              
              {filteredReservations.map((reservation) => (
                <Card key={reservation.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1">{reservation.customer.name}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            {reservation.customer.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(reservation.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[var(--color-cookite-blue)] text-gray-800">
                          Confirmado
                        </Badge>
                        <Badge variant="outline">
                          {reservation.id}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm mb-2 text-gray-800">Itens do Pedido:</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {reservation.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.quantity}x {item.productName}
                              </span>
                              <span className="text-gray-800">
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </span>
                            </div>
                          ))}
                          
                          <div className="border-t pt-2 mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>{formatCurrency(reservation.subtotal)}</span>
                            </div>
                            {reservation.discount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Desconto (20%):</span>
                                <span>-{formatCurrency(reservation.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t pt-1">
                              <span>Total:</span>
                              <span>{formatCurrency(reservation.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {reservation.customer.notes && (
                        <div>
                          <h4 className="text-sm mb-1 text-gray-800">Observações:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                            {reservation.customer.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}