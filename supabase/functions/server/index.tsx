import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Initialize Supabase client for server operations
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Types
interface ReservationItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface ReservationData {
  customer: {
    name: string;
    phone: string;
    email: string; // Add email field
    notes?: string;
  };
  items: ReservationItem[];
  subtotal: number;
  discount: number;
  total: number;
}

// Validation functions
function isValidBrazilianPhone(phone: string): boolean {
  // Remove all non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Brazilian phone number
  // Should be 10 digits (XX XXXX-XXXX) or 11 digits (XX XXXXX-XXXX) with area code
  return cleanPhone.length >= 10 && cleanPhone.length <= 11 && /^[1-9]\d/.test(cleanPhone);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    // Check common invalid domains
    const invalidDomains = ['example.com', 'test.com', 'fake.com', 'invalid.com'];
    if (invalidDomains.includes(domain.toLowerCase())) return false;
    
    // Basic DNS lookup would be ideal, but for now we'll do basic validation
    // In production, you might want to use an email validation service
    return true;
  } catch (error) {
    console.log('Email domain validation error:', error);
    return false;
  }
}

// Enhanced validation endpoint
app.post('/make-server-3664ed98/validate', async (c) => {
  try {
    const body = await c.req.json();
    const { email, phone } = body;
    
    const errors = [];
    
    if (email) {
      if (!isValidEmail(email)) {
        errors.push({ field: 'email', message: 'Email inválido' });
      } else {
        const validDomain = await validateEmailDomain(email);
        if (!validDomain) {
          errors.push({ field: 'email', message: 'Domínio do email inválido' });
        }
      }
    }
    
    if (phone) {
      if (!isValidBrazilianPhone(phone)) {
        errors.push({ field: 'phone', message: 'Número de telefone inválido. Use formato brasileiro (XX) XXXXX-XXXX' });
      }
    }
    
    return c.json({
      valid: errors.length === 0,
      errors
    });
    
  } catch (error) {
    console.log('Validation error:', error);
    return c.json({ 
      valid: false, 
      errors: [{ field: 'general', message: 'Erro na validação' }] 
    }, 500);
  }
});

// Create reservation endpoint
app.post("/make-server-3664ed98/reservations", async (c) => {
  try {
    const body: ReservationData = await c.req.json();

    // Enhanced validation
    const validationErrors = [];
    
    if (!body.customer?.name?.trim()) {
      validationErrors.push("Nome é obrigatório");
    }
    
    if (!body.customer?.email?.trim()) {
      validationErrors.push("Email é obrigatório");
    } else if (!isValidEmail(body.customer.email)) {
      validationErrors.push("Email inválido");
    }
    
    if (!body.customer?.phone?.trim()) {
      validationErrors.push("Telefone é obrigatório");
    } else if (!isValidBrazilianPhone(body.customer.phone)) {
      validationErrors.push("Número de telefone inválido. Use formato brasileiro (XX) XXXXX-XXXX");
    }
    
    if (!body.items?.length) {
      validationErrors.push("Selecione pelo menos um produto");
    }

    // Check email domain validity
    if (body.customer?.email && isValidEmail(body.customer.email)) {
      const validDomain = await validateEmailDomain(body.customer.email);
      if (!validDomain) {
        validationErrors.push("Domínio do email inválido ou suspeito");
      }
    }

    if (validationErrors.length > 0) {
      return c.json(
        {
          error: "Dados inválidos",
          details: validationErrors,
        },
        400,
      );
    }

    // Generate reservation ID
    const reservationId = `CKJP${Date.now().toString().slice(-6)}`;

    // Prepare reservation data
    const reservationData = {
      id: reservationId,
      customer: {
        name: body.customer.name.trim(),
        phone: body.customer.phone.trim(),
        email: body.customer.email.trim().toLowerCase(),
        notes: body.customer.notes?.trim() || ''
      },
      items: body.items,
      subtotal: body.subtotal,
      discount: body.discount,
      total: body.total,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      eventDate: "2025-09-12",
      eventLocation: "Escola Estadual Exemplo - Ginásio / Stand B",
    };

    // Save to KV store
    await kv.set(
      `reservation:${reservationId}`,
      reservationData,
    );

    // Also save in a list for easy retrieval
    const allReservations =
      (await kv.get("all_reservations")) || [];
    allReservations.push(reservationId);
    await kv.set("all_reservations", allReservations);

    // Send confirmation email with detailed logging
    let emailStatus = { success: false, message: "Email não enviado" };
    try {
      console.log(`Attempting to send email to: ${reservationData.customer.email}`);
      emailStatus = await sendConfirmationEmail(reservationData);
      console.log(`Email status:`, emailStatus);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      emailStatus = { success: false, message: `Erro no envio: ${emailError.message}` };
    }

    return c.json({
      success: true,
      reservationId,
      message: "Reserva confirmada com sucesso!",
      data: reservationData,
      emailStatus: emailStatus // Include email status in response for debugging
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return c.json(
      {
        error: "Erro interno do servidor ao processar reserva",
        details: error.message,
      },
      500,
    );
  }
});

// Get reservation by ID
app.get("/make-server-3664ed98/reservations/:id", async (c) => {
  try {
    const reservationId = c.req.param("id");
    const reservation = await kv.get(
      `reservation:${reservationId}`,
    );

    if (!reservation) {
      return c.json({ error: "Reserva não encontrada" }, 404);
    }

    return c.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log("Error fetching reservation:", error);
    return c.json(
      {
        error: "Erro ao buscar reserva",
        details: error.message,
      },
      500,
    );
  }
});

// List all reservations (admin endpoint)
app.get(
  "/make-server-3664ed98/admin/reservations",
  async (c) => {
    try {
      const allReservationIds =
        (await kv.get("all_reservations")) || [];
      const reservations = [];

      // Get all reservations
      for (const id of allReservationIds) {
        const reservation = await kv.get(`reservation:${id}`);
        if (reservation) {
          reservations.push(reservation);
        }
      }

      // Sort by creation date (newest first)
      reservations.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );

      return c.json({
        success: true,
        total: reservations.length,
        data: reservations,
      });
    } catch (error) {
      console.log("Error fetching reservations:", error);
      return c.json(
        {
          error: "Erro ao buscar reservas",
          details: error.message,
        },
        500,
      );
    }
  },
);

// Statistics endpoint
app.get("/make-server-3664ed98/admin/stats", async (c) => {
  try {
    const allReservationIds =
      (await kv.get("all_reservations")) || [];
    let totalRevenue = 0;
    let totalItems = 0;
    const productStats = {};

    // Calculate statistics
    for (const id of allReservationIds) {
      const reservation = await kv.get(`reservation:${id}`);
      if (reservation) {
        totalRevenue += reservation.total;
        reservation.items.forEach((item) => {
          totalItems += item.quantity;
          productStats[item.productName] =
            (productStats[item.productName] || 0) +
            item.quantity;
        });
      }
    }

    return c.json({
      success: true,
      data: {
        totalReservations: allReservationIds.length,
        totalRevenue,
        totalItems,
        productStats,
      },
    });
  } catch (error) {
    console.log("Error fetching stats:", error);
    return c.json(
      {
        error: "Erro ao buscar estatísticas",
        details: error.message,
      },
      500,
    );
  }
});

// Health check endpoint
app.get("/make-server-3664ed98/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Cookite Reservations API",
  });
});

// Debug endpoint to check email configuration
app.get('/make-server-3664ed98/debug/email', async (c) => {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    return c.json({
      hasApiKey: !!RESEND_API_KEY,
      keyLength: RESEND_API_KEY ? RESEND_API_KEY.length : 0,
      keyPrefix: RESEND_API_KEY ? RESEND_API_KEY.substring(0, 8) + '...' : 'No key',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      error: 'Debug check failed',
      details: error.message
    }, 500);
  }
});

// Test email endpoint
app.post('/make-server-3664ed98/debug/test-email', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const testReservation = {
      id: 'TEST123',
      customer: {
        name: 'Teste Usuario',
        email: email,
        phone: '(11) 99999-9999'
      },
      items: [
        { productName: 'Cookie Teste', quantity: 1, unitPrice: 5.00 }
      ],
      subtotal: 5.00,
      discount: 1.00,
      total: 4.00,
      eventLocation: 'Local de Teste'
    };

    const result = await sendConfirmationEmail(testReservation);
    
    return c.json({
      success: true,
      emailResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    return c.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Send reminder emails endpoint (can be called by cron job)
app.post('/make-server-3664ed98/admin/send-reminders', async (c) => {
  try {
    const eventDate = new Date('2025-09-12');
    const today = new Date();
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysUntilEvent = Math.ceil(timeDiff / (1000 * 3600 * 24));

    console.log(`Days until event: ${daysUntilEvent}`);

    // Only send reminders 7 days, 3 days, and 1 day before
    if (![7, 3, 1].includes(daysUntilEvent)) {
      return c.json({
        success: true,
        message: `No reminders scheduled for ${daysUntilEvent} days before event`,
        daysUntilEvent
      });
    }

    // Get all reservations
    const allReservationIds = (await kv.get('all_reservations')) || [];
    const results = {
      total: 0,
      sent: 0,
      failed: 0,
      errors: []
    };

    // Check which reservations already got reminders for this day
    const reminderKey = `reminders_sent_${daysUntilEvent}days`;
    const sentReminders = (await kv.get(reminderKey)) || [];

    for (const reservationId of allReservationIds) {
      try {
        results.total++;

        // Skip if reminder already sent for this timeframe
        if (sentReminders.includes(reservationId)) {
          console.log(`Reminder already sent for ${reservationId} (${daysUntilEvent} days)`);
          continue;
        }

        const reservation = await kv.get(`reservation:${reservationId}`);
        if (!reservation || reservation.status !== 'confirmed') {
          continue;
        }

        // Send reminder
        const emailResult = await sendReminderEmail(reservation, daysUntilEvent);
        
        if (emailResult.success) {
          results.sent++;
          sentReminders.push(reservationId);
          console.log(`Reminder sent to ${reservation.customer.email} for ${reservationId}`);
        } else {
          results.failed++;
          results.errors.push({
            reservationId,
            email: reservation.customer.email,
            error: emailResult.message
          });
          console.error(`Failed to send reminder for ${reservationId}:`, emailResult.message);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.failed++;
        results.errors.push({
          reservationId,
          error: error.message
        });
        console.error(`Error processing reminder for ${reservationId}:`, error);
      }
    }

    // Save the list of sent reminders
    await kv.set(reminderKey, sentReminders);

    return c.json({
      success: true,
      message: `Reminder batch completed for ${daysUntilEvent} days before event`,
      daysUntilEvent,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in reminder batch job:', error);
    return c.json({
      success: false,
      error: 'Failed to process reminder batch',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Manual reminder endpoint for specific reservation
app.post('/make-server-3664ed98/admin/send-reminder/:id', async (c) => {
  try {
    const reservationId = c.req.param('id');
    const { daysUntilEvent } = await c.req.json();

    if (!daysUntilEvent || daysUntilEvent < 1) {
      return c.json({ 
        error: 'daysUntilEvent is required and must be >= 1' 
      }, 400);
    }

    const reservation = await kv.get(`reservation:${reservationId}`);
    
    if (!reservation) {
      return c.json({ error: 'Reservation not found' }, 404);
    }

    const result = await sendReminderEmail(reservation, daysUntilEvent);

    return c.json({
      success: result.success,
      message: result.message,
      reservationId,
      daysUntilEvent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending manual reminder:', error);
    return c.json({
      success: false,
      error: 'Failed to send reminder',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Get reminder stats
app.get('/make-server-3664ed98/admin/reminder-stats', async (c) => {
  try {
    const eventDate = new Date('2025-09-12');
    const today = new Date();
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysUntilEvent = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const stats = {
      daysUntilEvent,
      eventDate: eventDate.toISOString(),
      remindersSent: {}
    };

    // Check reminder stats for each milestone
    for (const days of [7, 3, 1]) {
      const reminderKey = `reminders_sent_${days}days`;
      const sentReminders = (await kv.get(reminderKey)) || [];
      stats.remindersSent[`${days}_days`] = {
        count: sentReminders.length,
        reservationIds: sentReminders
      };
    }

    return c.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting reminder stats:', error);
    return c.json({
      success: false,
      error: 'Failed to get reminder stats',
      details: error.message
    }, 500);
  }
});

// Real email sending using Resend
async function sendConfirmationEmail(reservation: any) {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.log(
        "RESEND_API_KEY not configured, skipping email",
      );
      return {
        success: false,
        message: "API key não configurada",
      };
    }

    // Format items list
    const itemsList = reservation.items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.productName} - R$ ${(item.quantity * item.unitPrice).toFixed(2)}`,
      )
      .join("\n");

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Reserva - Cookite JEPP</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #A8D0E6 0%, #FFE9A8 100%);
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              color: #2c3e50;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              color: #34495e;
              margin: 10px 0 0 0;
              font-size: 16px;
            }
            .content {
              padding: 30px;
            }
            .reservation-code {
              background: #A8D0E6;
              color: #2c3e50;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
              letter-spacing: 2px;
            }
            .details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .items {
              margin: 15px 0;
              padding: 15px;
              background: white;
              border-radius: 6px;
              border-left: 4px solid #FFE9A8;
            }
            .total {
              font-size: 20px;
              font-weight: bold;
              color: #27ae60;
              text-align: right;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #eee;
            }
            .footer {
              background: #2c3e50;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 14px;
            }
            .event-info {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
            }
            .event-info strong {
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍪 Cookite JEPP</h1>
              <p>Confirmação de Reserva</p>
            </div>
            
            <div class="content">
              <h2>Olá, ${reservation.customer.name}! 👋</h2>
              
              <p>Que alegria ter você conosco! Sua reserva foi confirmada com sucesso para o evento JEPP do Sebrae. Estamos ansiosos para compartilhar nossos deliciosos doces com você!</p>
              
              <div class="reservation-code">
                ${reservation.id}
              </div>
              <p style="text-align: center; color: #666; font-style: italic;">
                ☝️ Este é seu código único de reserva. Guarde-o bem!
              </p>
              
              <div class="details">
                <h3>📋 Detalhes da sua reserva:</h3>
                
                <div class="items">
                  <h4>🛒 Itens reservados:</h4>
                  <div style="font-family: monospace; white-space: pre-line;">${itemsList}</div>
                </div>
                
                ${
                  reservation.discount > 0
                    ? `
                  <p><strong>Subtotal:</strong> R$ ${reservation.subtotal.toFixed(2)}</p>
                  <p style="color: #e74c3c;"><strong>Desconto (20%):</strong> -R$ ${reservation.discount.toFixed(2)}</p>
                `
                    : ""
                }
                
                <div class="total">
                  Total: R$ ${reservation.total.toFixed(2)}
                </div>
              </div>
              
              <div class="event-info">
                <h3>📅 Informações do evento:</h3>
                <p><strong>Data:</strong> 12 de Setembro de 2025</p>
                <p><strong>Local:</strong> ${reservation.eventLocation}</p>
                <p><strong>Retirada:</strong> Apresente este código na hora da retirada</p>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #2d6a2d; margin-top: 0;">💡 Importante:</h4>
                <ul style="color: #2d6a2d; margin: 0;">
                  <li>Leve este email ou anote seu código de reserva</li>
                  <li>A retirada será apenas no dia do evento</li>
                  <li>Qualquer dúvida, entre em contato conosco</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">
                Muito obrigado por escolher a Cookite! Mal podemos esperar para você experimentar nossos doces especiais no JEPP! 🎉
              </p>
              
              <p style="margin-top: 20px; color: #666;">
                Com carinho,<br>
                <strong>Equipe Cookite</strong> 💙
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Cookite - JEPP Sebrae 2025</strong></p>
              <p>Doces especiais para momentos especiais</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend API
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Cookite JEPP <noreply@resend.dev>",
          to: [reservation.customer.email],
          subject: `🍪 Reserva Confirmada - Código ${reservation.id} | Cookite JEPP`,
          html: emailHtml,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.log("Failed to send email via Resend:", result);
      return {
        success: false,
        message: "Erro ao enviar email",
        error: result,
      };
    }

    console.log(
      `Email sent successfully to ${reservation.customer.email} for reservation ${reservation.id}`,
    );
    return {
      success: true,
      message: "Email enviado com sucesso",
      emailId: result.id,
    };
  } catch (error) {
    console.log("Error sending confirmation email:", error);
    return {
      success: false,
      message: "Erro ao enviar email",
      error: error.message,
    };
  }
}

// Send reminder email function
async function sendReminderEmail(reservation: any, daysUntilEvent: number) {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping reminder email");
      return { success: false, message: "API key não configurada" };
    }

    const itemsList = reservation.items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.productName} - R$ ${(item.quantity * item.unitPrice).toFixed(2)}`,
      )
      .join("\n");

    const reminderHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lembrete - Sua reserva Cookite JEPP</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #FFE9A8 0%, #A8D0E6 100%);
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              color: #2c3e50;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 30px;
            }
            .countdown {
              background: #fff3cd;
              border: 2px solid #ffeaa7;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .countdown h2 {
              color: #856404;
              margin: 0 0 10px 0;
              font-size: 2.2rem;
            }
            .reservation-code {
              background: #A8D0E6;
              color: #2c3e50;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
              letter-spacing: 2px;
            }
            .details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .items {
              margin: 15px 0;
              padding: 15px;
              background: white;
              border-radius: 6px;
              border-left: 4px solid #FFE9A8;
            }
            .important {
              background: #e8f5e8;
              border: 2px solid #c3e6c3;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .footer {
              background: #2c3e50;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍪 Cookite JEPP</h1>
              <p>⏰ Lembrete da sua Reserva</p>
            </div>
            
            <div class="content">
              <h2>Olá, ${reservation.customer.name}! 👋</h2>
              
              <div class="countdown">
                <h2>${daysUntilEvent === 1 ? 'AMANHÃ!' : `${daysUntilEvent} DIAS!`}</h2>
                <p style="margin: 0; font-size: 1.1rem; color: #856404;">
                  ${daysUntilEvent === 1 
                    ? 'Seu pedido Cookite estará pronto para retirada amanhã!' 
                    : `Faltam apenas ${daysUntilEvent} dias para retirar seus doces!`}
                </p>
              </div>
              
              <p>Estamos quase lá! Seus deliciosos doces da Cookite estarão fresquinhos esperando por você no evento JEPP do Sebrae.</p>
              
              <div class="reservation-code">
                ${reservation.id}
              </div>
              <p style="text-align: center; color: #666; font-style: italic;">
                ☝️ Não esqueça do seu código de reserva!
              </p>
              
              <div class="details">
                <h3>📋 Detalhes da sua reserva:</h3>
                
                <div class="items">
                  <h4>🛒 Seus doces reservados:</h4>
                  <div style="font-family: monospace; white-space: pre-line;">${itemsList}</div>
                </div>
                
                <div style="font-size: 18px; font-weight: bold; color: #27ae60; text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee;">
                  Total: R$ ${reservation.total.toFixed(2)}
                </div>
              </div>
              
              <div class="important">
                <h3 style="color: #2d6a2d; margin-top: 0;">📍 Informações Importantes:</h3>
                <ul style="color: #2d6a2d; margin: 10px 0;">
                  <li><strong>Data:</strong> 12 de Setembro de 2025</li>
                  <li><strong>Horário:</strong> 09:00 às 16:00</li>
                  <li><strong>Local:</strong> ${reservation.eventLocation}</li>
                  <li><strong>Pagamento:</strong> PIX ou dinheiro na retirada</li>
                  <li><strong>O que levar:</strong> Este código de reserva</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">
                Mal podemos esperar para você provar nossos doces especiais! Será uma alegria vê-lo(a) no evento! 🎉
              </p>
              
              <p style="margin-top: 20px; color: #666;">
                Com muito carinho,<br>
                <strong>Equipe Cookite</strong> 💙
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Cookite - JEPP Sebrae 2025</strong></p>
              <p>Doces especiais para momentos especiais</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cookite JEPP <noreply@resend.dev>",
        to: [reservation.customer.email],
        subject: `⏰ ${daysUntilEvent === 1 ? 'AMANHÃ!' : `${daysUntilEvent} dias!`} Lembrete da sua reserva Cookite | ${reservation.id}`,
        html: reminderHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Failed to send reminder email:", result);
      return { success: false, message: "Erro ao enviar lembrete", error: result };
    }

    console.log(
      `Reminder email sent successfully to ${reservation.customer.email} for reservation ${reservation.id} (${daysUntilEvent} days until event)`,
    );
    return { success: true, message: "Lembrete enviado com sucesso", emailId: result.id };

  } catch (error) {
    console.log("Error sending reminder email:", error);
    return { success: false, message: "Erro ao enviar lembrete", error: error.message };
  }
}

Deno.serve(app.fetch);