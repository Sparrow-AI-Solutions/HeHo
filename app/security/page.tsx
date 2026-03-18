import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-bold text-foreground mb-8">Security & Privacy</h1>

          <div className="space-y-12">
            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Ownership & Control</h2>
              <p className="text-muted-foreground mb-4">
                Your data is your own. HeHo only stores authentication data and chatbot configuration in our Supabase instance. Your business data, database connections, and chatbot memories are stored exclusively in your own Supabase project under your complete control.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Business data never leaves your Supabase database</li>
                <li>• You maintain full ownership and control of all data</li>
                <li>• HeHo acts as an orchestration layer, not a data repository</li>
                <li>• Data isolation enforced through Row Level Security (RLS)</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Encryption & Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                All sensitive data is encrypted both in transit and at rest using industry-standard encryption protocols.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• All data encrypted in transit using HTTPS/TLS 1.3</li>
                <li>• API keys encrypted at rest using AES-256 encryption</li>
                <li>• Encryption keys managed securely and rotated regularly</li>
                <li>• No plaintext storage of sensitive credentials</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">API Key Security</h2>
              <p className="text-muted-foreground mb-4">
                Your OpenRouter, Supabase, and HeHo API keys are encrypted and never exposed to the frontend or client-side code.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Keys encrypted with AES-256 before storage</li>
                <li>• Only used server-side for API requests</li>
                <li>• Automatically rotated on demand from settings</li>
                <li>• Never logged, exposed in error messages, or shared with third parties</li>
                <li>• Access logs maintained for audit purposes</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Authentication & Access Control</h2>
              <p className="text-muted-foreground mb-4">Secure account protection powered by Supabase Auth with industry-standard security practices.</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Email verification required for signup</li>
                <li>• Passwords hashed with bcrypt (12 rounds)</li>
                <li>• JWT tokens with 7-day expiration</li>
                <li>• CSRF protection on all state-changing requests</li>
                <li>• Session management with automatic timeout</li>
                <li>• Support for secure password reset flows</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Database Permissions & Autonomous Operations</h2>
              <p className="text-muted-foreground mb-4">You maintain complete control over what your AI agents can access and modify in your database.</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Read-only access (configurable per chatbot)</li>
                <li>• Write/insert permissions (configurable per chatbot)</li>
                <li>• Edit/update permissions (configurable per chatbot)</li>
                <li>• Delete operations (disabled by default for safety)</li>
                <li>• Table-level access control</li>
                <li>• Audit logs for all autonomous operations</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Integrations</h2>
              <p className="text-muted-foreground mb-4">HeHo integrates with trusted third-party services. Data sharing is minimal and necessary for core functionality.</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• OpenRouter receives only prompts and necessary context for AI processing</li>
                <li>• Supabase stores your database and authentication data</li>
                <li>• No data is shared with other third parties</li>
                <li>• All third-party integrations comply with GDPR and data protection laws</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Compliance & Standards</h2>
              <p className="text-muted-foreground mb-4">HeHo follows industry standards and regulations for data protection and privacy.</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• GDPR compliant data processing and user rights</li>
                <li>• User data deletion on account removal</li>
                <li>• No automated decision-making or profiling</li>
                <li>• Regular security audits and penetration testing</li>
                <li>• Compliance with SOC 2 principles</li>
                <li>• Regular security updates and patches</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">REST API Security</h2>
              <p className="text-muted-foreground mb-4">HeHo's REST API includes security measures to protect programmatic access to your systems.</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Bearer token authentication required for all requests</li>
                <li>• Rate limiting to prevent abuse</li>
                <li>• Request validation and sanitization</li>
                <li>• API key rotation support</li>
                <li>• Audit logging for all API requests</li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Best Practices for Users</h2>
              <p className="text-muted-foreground mb-4">To maintain security, we recommend following these best practices:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Never share your API keys in public repositories or client-side code</li>
                <li>• Rotate your API keys regularly</li>
                <li>• Use strong, unique passwords for your HeHo account</li>
                <li>• Enable two-factor authentication on your Supabase account</li>
                <li>• Review and audit autonomous operations regularly</li>
                <li>• Maintain backups of critical data</li>
                <li>• Use environment variables to store sensitive credentials</li>
                <li>• Monitor your Supabase audit logs for suspicious activity</li>
              </ul>
            </Card>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8">
              <h3 className="text-lg font-bold text-foreground mb-2">Report Security Issues</h3>
              <p className="text-muted-foreground">
                Found a security vulnerability? Please email <strong>security@heho.dev</strong> instead of opening a public issue. We take security seriously and will investigate all reports promptly. Please include details about the vulnerability and steps to reproduce it.
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-12 pt-8 border-t border-border/50">
              <p>HeHo is defined and owned by Sparrow AI Solutions 2026 HeHo. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
