import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface ReservationItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ReservationData {
  customer: {
    name: string;
    phone: string;
    email: string;
    notes?: string;
  };
  items: ReservationItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface CreateReservationResponse {
  success: boolean;
  reservationId?: string;
  message?: string;
  error?: string;
  emailStatus?: {
    success: boolean;
    message: string;
  };
}

// Request queue and rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 100; // Minimum 100ms between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
      }
      
      const request = this.queue.shift();
      if (request) {
        try {
          this.lastRequestTime = Date.now();
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// Retry mechanism with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>, 
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const isServerError = error instanceof Error && 
        (error.message.includes('500') || error.message.includes('502') || error.message.includes('503'));
      
      if (isServerError) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Don't retry client errors (400, 401, etc.)
      }
    }
  }
  throw new Error('Max retry attempts reached');
}

// Enhanced error handling
function handleApiError(response: Response, data: any): CreateReservationResponse {
  const statusText = response.statusText || 'Unknown error';
  
  switch (response.status) {
    case 400:
      return {
        success: false,
        error: Array.isArray(data.details) ? data.details.join(', ') : (data.error || 'Dados inválidos')
      };
    case 429:
      return {
        success: false,
        error: 'Muitas tentativas. Aguarde alguns segundos e tente novamente.'
      };
    case 500:
      return {
        success: false,
        error: 'Erro interno do servidor. Tente novamente em alguns instantes.'
      };
    case 502:
    case 503:
      return {
        success: false,
        error: 'Servidor temporariamente indisponível. Tente novamente em alguns instantes.'
      };
    default:
      return {
        success: false,
        error: `Erro ${response.status}: ${statusText}`
      };
  }
}

export function useReservations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReservation = async (data: ReservationData): Promise<CreateReservationResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestQueue.add(async () => {
        return await withRetry(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

          try {
            console.log('Sending reservation request:', {
              customer: data.customer.name,
              items: data.items.length,
              total: data.total
            });

            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3664ed98/reservations`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
                body: JSON.stringify(data),
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            let responseData;
            try {
              responseData = await response.json();
            } catch (parseError) {
              console.error('Failed to parse response JSON:', parseError);
              throw new Error(`Invalid response from server (${response.status})`);
            }

            console.log('Server response:', {
              status: response.status,
              success: responseData?.success,
              reservationId: responseData?.reservationId,
              emailStatus: responseData?.emailStatus
            });

            if (!response.ok) {
              const errorResponse = handleApiError(response, responseData);
              throw new Error(errorResponse.error);
            }

            if (!responseData.success) {
              throw new Error(responseData.error || responseData.message || 'Erro desconhecido');
            }

            return {
              success: true,
              reservationId: responseData.reservationId,
              message: responseData.message || 'Reserva criada com sucesso!',
              emailStatus: responseData.emailStatus
            };

          } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              throw new Error('Tempo limite excedido. Tente novamente.');
            }
            
            throw fetchError;
          }
        });
      });

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Reservation creation failed:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getAllReservations = async (): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestQueue.add(async () => {
        return await withRetry(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3664ed98/admin/reservations`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            let responseData;
            try {
              responseData = await response.json();
            } catch (parseError) {
              console.error('Failed to parse reservations response JSON:', parseError);
              throw new Error(`Invalid response from server (${response.status})`);
            }

            if (!response.ok) {
              const errorResponse = handleApiError(response, responseData);
              throw new Error(errorResponse.error);
            }

            return responseData;

          } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              throw new Error('Tempo limite excedido. Tente novamente.');
            }
            
            throw fetchError;
          }
        });
      });

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Get reservations failed:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = async (): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestQueue.add(async () => {
        return await withRetry(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3664ed98/admin/stats`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            let responseData;
            try {
              responseData = await response.json();
            } catch (parseError) {
              console.error('Failed to parse stats response JSON:', parseError);
              throw new Error(`Invalid response from server (${response.status})`);
            }

            if (!response.ok) {
              const errorResponse = handleApiError(response, responseData);
              throw new Error(errorResponse.error);
            }

            return responseData;

          } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              throw new Error('Tempo limite excedido. Tente novamente.');
            }
            
            throw fetchError;
          }
        });
      });

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Get stats failed:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createReservation,
    getAllReservations,
    getStats,
    isLoading,
    error,
  };
}