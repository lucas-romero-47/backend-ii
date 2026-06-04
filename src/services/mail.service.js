const { resendApiKey, mailFrom, baseUrl } = require('../config/config');

class MailService {
    constructor() {
        this.apiKey = resendApiKey;
        this.from = mailFrom;
        this.baseUrl = baseUrl;
    }

    async sendMail({ to, subject, html }) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: this.from,
                    to: [to],
                    subject,
                    html
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error al enviar email:', data);
                return { success: false, error: data };
            }

            console.log('Email enviado exitosamente:', data.id);
            return { success: true, id: data.id };
        } catch (error) {
            console.error('Error al enviar email:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordResetEmail(email, resetToken) {
        const resetLink = `${this.baseUrl}/api/sessions/reset-password?token=${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Recuperación de Contraseña</h2>
                <p>Hola,</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el siguiente botón para crear una nueva contraseña:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Restablecer Contraseña
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">Este enlace expirará en <strong>1 hora</strong>.</p>
                <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, podés ignorar este correo.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Ecommerce Backend II</p>
            </div>
        `;

        return await this.sendMail({
            to: email,
            subject: 'Restablecer contraseña - Ecommerce',
            html
        });
    }

    async sendPurchaseEmail(email, ticket) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">¡Compra realizada con éxito!</h2>
                <p>Hola,</p>
                <p>Tu compra ha sido procesada correctamente. Aquí están los detalles de tu ticket:</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Código de Ticket:</strong> ${ticket.code}</p>
                    <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString('es-AR')}</p>
                    <p><strong>Monto Total:</strong> $${ticket.amount.toFixed(2)}</p>
                    <p><strong>Comprador:</strong> ${ticket.purchaser}</p>
                </div>
                <p>¡Gracias por tu compra!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Ecommerce Backend II</p>
            </div>
        `;

        return await this.sendMail({
            to: email,
            subject: `Ticket de compra #${ticket.code} - Ecommerce`,
            html
        });
    }
}

module.exports = new MailService();
