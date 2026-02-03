import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface EmailParams {
    to_email: string;
    to_name: string;
    subject: string;
    message: string;
    password?: string;
    role?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    // Web3Forms Access Key
    private accessKey = '6732cfb7-5cfa-4571-a158-3ffe8cc00ec3';

    isSending = signal(false);

    constructor(private http: HttpClient) { }

    async sendCredentialsEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
        this.isSending.set(true);

        // If access key not configured, use mailto fallback
        if (this.accessKey === 'YOUR_ACCESS_KEY_HERE') {
            this.isSending.set(false);
            return this.fallbackMailto(params);
        }

        try {
            const emailBody = `
Hello ${params.to_name},

Your registration as ${params.role} has been approved!

🔐 Login Credentials:
━━━━━━━━━━━━━━━━━━━━━
Email: ${params.to_email}
Password: ${params.password}
━━━━━━━━━━━━━━━━━━━━━

🔗 Login URL: ${window.location.origin}/login

Please change your password after your first login.

Best regards,
EduTech Admin Team
            `.trim();

            const response = await firstValueFrom(
                this.http.post<any>('https://api.web3forms.com/submit', {
                    access_key: this.accessKey,
                    subject: params.subject || 'Welcome to EduTech - Your Login Credentials',
                    from_name: 'EduTech Admin',
                    to: params.to_email,
                    message: emailBody
                })
            );

            this.isSending.set(false);

            if (response.success) {
                return { success: true, message: 'Email sent successfully!' };
            } else {
                return { success: false, message: response.message || 'Failed to send email.' };
            }
        } catch (error: any) {
            this.isSending.set(false);
            console.error('Email sending failed:', error);
            return { success: false, message: error.message || 'Failed to send email.' };
        }
    }

    private fallbackMailto(params: EmailParams): { success: boolean; message: string } {
        const subject = encodeURIComponent(params.subject || 'Your EduTech Login Credentials');
        const body = encodeURIComponent(
            `Hello ${params.to_name},\n\n` +
            `Your registration as ${params.role} has been approved!\n\n` +
            `Login Credentials:\n` +
            `Email: ${params.to_email}\n` +
            `Password: ${params.password}\n\n` +
            `Login URL: ${window.location.origin}/login\n\n` +
            `Please change your password after first login.\n\n` +
            `Best regards,\nEduTech Admin Team`
        );

        const mailtoLink = `mailto:${params.to_email}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');

        return {
            success: true,
            message: 'Email client opened. Please send the email manually.'
        };
    }

    // Configure access key at runtime
    setAccessKey(key: string) {
        this.accessKey = key;
    }
}
