import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ShoppingCart, Plus, Minus, User, Phone, MessageSquare, CheckCircle, Instagram, Copy, Mail, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useReservations } from "../hooks/useReservations";
import { useValidation } from "../hooks/useValidation";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  {
    id: 'palha-italiana',
    name: 'Palha Italiana',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&crop=center'
  },
  {
    id: 'cookie',
    name: 'Cookie',
    price: 7.00,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop&crop=center'
  },
  {
    id: 'cake-pop',
    name: 'Cake Pop',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop&crop=center'
  },
  {
    id: 'biscoito-amantegado',
    name: 'Biscoito Amantegado',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop&crop=center'
  }
];

export function ReservationForm() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [reservationResult, setReservationResult] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  const { createReservation, isLoading, error } = useReservations();
  const { isValidating, formatPhone, validateLocal, validateWithServer, isValidEmail, isValidBrazilianPhone } = useValidation();

  // Memoized calculations for better performance
  const calculations = useMemo(() => {
    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    const subtotal = products.reduce((sum, product) => {
      const qty = quantities[product.id] || 0;
      return sum + (product.price * qty);
    }, 0);
    const discount = subtotal * 0.2; // 20% discount
    const total = subtotal - discount;

    return { totalItems, subtotal, discount, total };
  }, [quantities]);

  // Debounced validation
  useEffect(() => {
    if (!hasAttemptedSubmit) return;
    
    const timeoutId = setTimeout(() => {
      const errors = validateLocal(customerInfo);
      const errorMap: Record<string, string> = {};
      
      errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      
      setValidationErrors(errorMap);
    }, 300); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [customerInfo, hasAttemptedSubmit, validateLocal]);

  // Optimized quantity update with debouncing for rapid clicks
  const updateQuantity = useCallback((productId: string, delta: number) => {
    setQuantities(prev => {
      const newValue = Math.max(0, (prev[productId] || 0) + delta);
      return { ...prev, [productId]: newValue };
    });
  }, []);

  // Format phone number automatically with debouncing
  const handlePhoneChange = useCallback((value: string) => {
    const formatted = formatPhone(value);
    setCustomerInfo(prev => ({ ...prev, phone: formatted }));
  }, [formatPhone]);

  // Enhanced field validation with caching
  const [validationCache, setValidationCache] = useState<Record<string, boolean>>({});
  
  const handleFieldBlur = useCallback(async (field: 'email' | 'phone') => {
    const value = customerInfo[field];
    if (!value.trim()) return;
    
    // Check cache first
    const cacheKey = `${field}:${value}`;
    if (validationCache[cacheKey] !== undefined) {
      return;
    }
    
    if (field === 'email' && customerInfo.email) {
      try {
        const result = await validateWithServer(customerInfo.email);
        
        // Cache result
        setValidationCache(prev => ({ ...prev, [cacheKey]: result.valid }));
        
        if (!result.valid) {
          const emailError = result.errors.find(e => e.field === 'email');
          if (emailError) {
            setValidationErrors(prev => ({ ...prev, email: emailError.message }));
          }
        } else {
          setValidationErrors(prev => ({ ...prev, email: '' }));
        }
      } catch (error) {
        console.error('Email validation failed:', error);
      }
    }
    
    if (field === 'phone' && customerInfo.phone) {
      try {
        const result = await validateWithServer(undefined, customerInfo.phone);
        
        // Cache result
        setValidationCache(prev => ({ ...prev, [cacheKey]: result.valid }));
        
        if (!result.valid) {
          const phoneError = result.errors.find(e => e.field === 'phone');
          if (phoneError) {
            setValidationErrors(prev => ({ ...prev, phone: phoneError.message }));
          }
        } else {
          setValidationErrors(prev => ({ ...prev, phone: '' }));
        }
      } catch (error) {
        console.error('Phone validation failed:', error);
      }
    }
  }, [customerInfo.email, customerInfo.phone, validateWithServer, validationCache]);

  const copyReservationId = useCallback(async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("ID da reserva copiado!");
    } catch (err) {
      toast.error("Erro ao copiar ID");
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setHasAttemptedSubmit(true);
    
    if (calculations.totalItems === 0) {
      toast.error("Adicione pelo menos um produto à sua reserva");
      return;
    }

    // Client-side validation first
    const localErrors = validateLocal(customerInfo);
    if (localErrors.length > 0) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    // Prepare reservation data
    const reservationData = {
      customer: {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        email: customerInfo.email.trim().toLowerCase(),
        notes: customerInfo.notes.trim()
      },
      items: products.filter(p => quantities[p.id] > 0).map(p => ({
        productId: p.id,
        productName: p.name,
        quantity: quantities[p.id],
        unitPrice: p.price
      })),
      subtotal: calculations.subtotal,
      discount: calculations.discount,
      total: calculations.total
    };

    try {
      const result = await createReservation(reservationData);
      
      if (result.success) {
        toast.success("Reserva confirmada com sucesso! 🎉");
        setReservationResult(result.reservationId!);
        
        // Reset form state
        setQuantities({});
        setCustomerInfo({ name: '', phone: '', email: '', notes: '' });
        setValidationErrors({});
        setValidationCache({});
        setHasAttemptedSubmit(false);
        
        // Smooth scroll to success message
        setTimeout(() => {
          const element = document.getElementById('reservation-success');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        toast.error(result.error || "Erro ao processar reserva");
      }
    } catch (err) {
      console.error('Error submitting reservation:', err);
      toast.error("Erro inesperado. Tente novamente.");
    }
  }, [calculations, customerInfo, quantities, validateLocal, createReservation]);

  // Reset reservation result
  const handleNewReservation = useCallback(() => {
    setReservationResult(null);
    // Scroll to top of form
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Show success message if reservation was created
  if (reservationResult) {
    return (
      <section id="reservation-success" className="py-12 md:py-16 px-4 bg-[var(--color-cookite-gray)]">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-2 border-green-200">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="mb-4 text-green-800 text-xl md:text-2xl">Reserva Confirmada! 🎉</h2>
              <p className="mb-6 text-gray-600">
                Sua reserva foi processada com sucesso. Anote seu código de reserva:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 flex items-center justify-center gap-3">
                <code className="text-xl md:text-2xl font-bold text-[var(--color-cookite-blue)]">
                  {reservationResult}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyReservationId(reservationResult)}
                  className="rounded-lg"
                >
                  <Copy size={16} />
                </Button>
              </div>

              <div className="space-y-3 text-sm md:text-base text-gray-600 mb-6">
                <p>📧 <strong>Email de confirmação</strong> enviado com todos os detalhes</p>
                <p>📍 <strong>Retirada:</strong> 12/09/2025 das 09:00 às 16:00</p>
                <p>📍 <strong>Local:</strong> Escola Estadual Exemplo - Ginásio / Stand B</p>
                <p>💰 <strong>Pagamento:</strong> PIX ou dinheiro na retirada</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleNewReservation}
                  className="bg-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue-hover)] text-white rounded-2xl"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Fazer Nova Reserva
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-[var(--color-cookite-blue)] text-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue)] hover:text-white rounded-2xl"
                >
                  <a 
                    href="https://instagram.com/cookite_oficial" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Instagram size={20} />
                    Seguir no Instagram
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="reservation" className="py-12 md:py-16 px-4 bg-[var(--color-cookite-gray)]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="mb-3 md:mb-4 text-gray-800 text-2xl md:text-3xl">Faça sua Reserva</h2>
          <p className="text-gray-600 text-sm md:text-base mb-4">
            Selecione seus doces favoritos e garanta 20% de desconto
          </p>
          <Badge className="bg-[var(--color-cookite-yellow)] text-gray-800 px-4 py-2">
            ✨ Desconto automático de 20% aplicado
          </Badge>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-xl text-red-700 text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Products Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <ShoppingCart size={24} />
                Selecione os produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      width={64}
                      height={64}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base text-gray-800">{product.name}</h4>
                      <p className="text-sm text-[var(--color-cookite-blue)] font-medium">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, -1)}
                        disabled={!quantities[product.id]}
                        className="w-8 h-8 p-0 rounded-full"
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center text-sm md:text-base">
                        {quantities[product.id] || 0}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-8 h-8 p-0 rounded-full"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          {calculations.totalItems > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm md:text-base">
                  <div className="flex justify-between">
                    <span>Subtotal ({calculations.totalItems} items)</span>
                    <span>R$ {calculations.subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Desconto (20%)</span>
                    <span>-R$ {calculations.discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-lg md:text-xl font-bold text-[var(--color-cookite-blue)] pt-2 border-t">
                    <span>Total</span>
                    <span>R$ {calculations.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User size={24} />
                Seus dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base">Nome completo *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                    className={`rounded-xl ${validationErrors.name ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {validationErrors.name && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{validationErrors.name}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1 text-sm md:text-base">
                    <Mail size={16} />
                    Email *
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      onBlur={() => handleFieldBlur('email')}
                      placeholder="seu@email.com"
                      required
                      className={`rounded-xl ${validationErrors.email ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    {isValidating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin w-4 h-4 border-2 border-[var(--color-cookite-blue)] border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {validationErrors.email && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{validationErrors.email}</span>
                    </div>
                  )}
                  {customerInfo.email && !validationErrors.email && isValidEmail(customerInfo.email) && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle size={14} />
                      <span>Email válido</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1 text-sm md:text-base">
                  <Phone size={16} />
                  WhatsApp *
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => handleFieldBlur('phone')}
                    placeholder="(11) 99999-9999"
                    required
                    className={`rounded-xl ${validationErrors.phone ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                    maxLength={15}
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin w-4 h-4 border-2 border-[var(--color-cookite-blue)] border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                {validationErrors.phone && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    <span>{validationErrors.phone}</span>
                  </div>
                )}
                {customerInfo.phone && !validationErrors.phone && isValidBrazilianPhone(customerInfo.phone) && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle size={14} />
                    <span>Número válido</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-1 text-sm md:text-base">
                  <MessageSquare size={16} />
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Alguma observação especial sobre seu pedido?"
                  rows={3}
                  className="rounded-xl resize-none"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center space-y-4">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || calculations.totalItems === 0}
              className="w-full md:w-auto bg-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue-hover)] text-white rounded-2xl px-8 py-3 text-base md:text-lg"
            >
              {isLoading ? (
                <>Processando reserva...</>
              ) : (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Confirmar Reserva
                </>
              )}
            </Button>
            
            <div className="text-xs md:text-sm text-gray-600">
              <p className="mb-2">Ou prefere pedir pelo Instagram?</p>
              <Button 
                type="button"
                variant="outline"
                asChild
                className="border-[var(--color-cookite-blue)] text-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue)] hover:text-white rounded-xl"
                disabled={isLoading}
              >
                <a 
                  href="https://instagram.com/cookite_oficial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Instagram size={16} />
                  @cookite_oficial
                </a>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}