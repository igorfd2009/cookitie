import { useState, useCallback } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function useValidation() {
  const [isValidating, setIsValidating] = useState(false);

  // Local validation functions (same as server-side)
  const isValidBrazilianPhone = useCallback((phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11 && /^[1-9]\d/.test(cleanPhone);
  }, []);

  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const formatPhone = useCallback((phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Apply Brazilian phone formatting
    if (cleaned.length <= 10) {
      // Format: (XX) XXXX-XXXX
      const match = cleaned.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/);
      if (match) {
        const formatted = [
          match[1] ? `(${match[1]}` : '',
          match[1] && match[1].length === 2 ? ') ' : '',
          match[2],
          match[3] ? `-${match[3]}` : ''
        ].join('');
        return formatted;
      }
    } else {
      // Format: (XX) XXXXX-XXXX  
      const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        const formatted = [
          match[1] ? `(${match[1]}` : '',
          match[1] && match[1].length === 2 ? ') ' : '',
          match[2],
          match[3] ? `-${match[3]}` : ''
        ].join('');
        return formatted;
      }
    }
    
    return phone;
  }, []);

  // Server-side validation
  const validateWithServer = useCallback(async (email?: string, phone?: string): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3664ed98/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, phone })
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Server validation error:', error);
      return {
        valid: false,
        errors: [{ field: 'general', message: 'Erro na validação. Tente novamente.' }]
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Real-time local validation
  const validateLocal = useCallback((data: { name?: string, email?: string, phone?: string }): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push({ field: 'name', message: 'Nome é obrigatório' });
      } else if (data.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Nome muito curto' });
      }
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        errors.push({ field: 'email', message: 'Email é obrigatório' });
      } else if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Email inválido' });
      }
    }

    if (data.phone !== undefined) {
      if (!data.phone.trim()) {
        errors.push({ field: 'phone', message: 'Telefone é obrigatório' });
      } else if (!isValidBrazilianPhone(data.phone)) {
        errors.push({ field: 'phone', message: 'Número inválido. Use formato (XX) XXXXX-XXXX' });
      }
    }

    return errors;
  }, [isValidEmail, isValidBrazilianPhone]);

  return {
    isValidating,
    isValidEmail,
    isValidBrazilianPhone,
    formatPhone,
    validateWithServer,
    validateLocal
  };
}