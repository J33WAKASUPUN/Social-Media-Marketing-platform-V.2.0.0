import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, ArrowLeft, Scale, CheckCircle, AlertTriangle, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="section-heading mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Effective Date: December 1, 2025 • Last Updated: December 1, 2025
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
          >
            {[
              { icon: Scale, label: "User Rights", href: "#user-rights" },
              { icon: CheckCircle, label: "Acceptable Use", href: "#acceptable-use" },
              { icon: AlertTriangle, label: "Limitations", href: "#limitations" },
              { icon: Globe, label: "Governing Law", href: "#governing-law" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            ))}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-8"
          >
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                Acceptance of Terms
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using SocialFlow (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  These Terms apply to all users of the Service, including but not limited to users who are also contributors of content, information, and other materials or services on the Service.
                </p>
              </div>
            </section>

            {/* 2. Description of Service */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400 font-bold">2</span>
                </div>
                Description of Service
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4">
                  SocialFlow provides a social media management platform that enables users to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Schedule and publish content across multiple social media platforms</li>
                  <li>Manage social media accounts (LinkedIn, Facebook, Instagram, Twitter, YouTube, WhatsApp Business)</li>
                  <li>Access analytics and reporting tools</li>
                  <li>Collaborate with team members</li>
                  <li>Store and organize media assets</li>
                </ul>
              </div>
            </section>

            {/* 3. User Accounts */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">3</span>
                </div>
                User Accounts
              </h2>
              <div className="glass-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Creation</h3>
                  <p className="text-muted-foreground">
                    To use the Service, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Responsibility</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must notify us immediately of any unauthorized use</li>
                    <li>You must be at least 18 years old to use the Service</li>
                    <li>You may not share your account with others</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Acceptable Use Policy */}
            <section id="acceptable-use">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">4</span>
                </div>
                Acceptable Use Policy
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4 font-semibold">
                  You agree NOT to use the Service to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Post spam, malware, or malicious content</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Impersonate any person or entity</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Scrape or harvest data from the Service</li>
                </ul>
              </div>
            </section>

            {/* 5. Social Media Platform Compliance */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">5</span>
                </div>
                Third-Party Platform Compliance
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4">
                  When using SocialFlow to manage third-party social media accounts, you must comply with the terms of service and policies of each platform:
                </p>
                <div className="space-y-2">
                  {[
                    { name: "Meta (Facebook & Instagram)", url: "https://www.facebook.com/terms.php" },
                    { name: "Twitter (X)", url: "https://twitter.com/en/tos" },
                    { name: "LinkedIn", url: "https://www.linkedin.com/legal/user-agreement" },
                    { name: "YouTube", url: "https://www.youtube.com/t/terms" },
                    { name: "WhatsApp Business", url: "https://www.whatsapp.com/legal/business-terms" },
                  ].map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm font-medium">{platform.name}</span>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Terms →
                      </a>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-500/30">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Violation of third-party platform policies may result in suspension or termination of your SocialFlow account.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Subscription and Payment */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">6</span>
                </div>
                Subscription and Payment
              </h2>
              <div className="glass-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Billing</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Free plan available with limited features</li>
                    <li>Paid plans billed monthly or annually</li>
                    <li>All fees are non-refundable unless required by law</li>
                    <li>Prices may change with 30 days notice</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cancellation</h3>
                  <p className="text-muted-foreground">
                    You may cancel your subscription at any time. Your account will remain active until the end of your current billing period. No refunds will be issued for partial months.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <span className="text-pink-600 dark:text-pink-400 font-bold">7</span>
                </div>
                Intellectual Property Rights
              </h2>
              <div className="glass-card p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Content</h3>
                  <p className="text-muted-foreground">
                    You retain all rights to the content you upload or create using the Service. By using the Service, you grant us a limited license to store, display, and transmit your content solely to provide the Service.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Our Content</h3>
                  <p className="text-muted-foreground">
                    The Service, including its design, features, and underlying technology, is owned by SocialFlow and protected by intellectual property laws. You may not copy, modify, or reverse engineer any part of the Service.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Limitation of Liability */}
            <section id="limitations">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-bold">8</span>
                </div>
                Limitation of Liability
              </h2>
              <div className="glass-card p-6 border-red-500/20">
                <p className="text-muted-foreground mb-4 font-semibold uppercase text-sm">
                  Important Legal Notice
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, SOCIALFLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Your use or inability to use the Service</li>
                  <li>Unauthorized access to your account or data</li>
                  <li>Content posted by third parties</li>
                  <li>Service interruptions or errors</li>
                  <li>Loss of social media accounts or data</li>
                </ul>
              </div>
            </section>

            {/* 9. Warranty Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">9</span>
                </div>
                Warranty Disclaimer
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>
              </div>
            </section>

            {/* 10. Termination */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">10</span>
                </div>
                Termination
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4">
                  We reserve the right to suspend or terminate your account at any time for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Non-payment of fees</li>
                  <li>Request by law enforcement or government agencies</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Upon termination, your right to use the Service will immediately cease. We may delete your data after 30 days.
                </p>
              </div>
            </section>

            {/* 11. Governing Law */}
            <section id="governing-law">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">11</span>
                </div>
                Governing Law and Disputes
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
                <p className="text-muted-foreground">
                  Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of [Arbitration Body].
                </p>
              </div>
            </section>

            {/* 12. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400 font-bold">12</span>
                </div>
                Changes to Terms
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* 13. Contact */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">13</span>
                </div>
                Contact Us
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <a href="mailto:dev@innovior.lk" className="text-primary hover:underline">
                      dev@innovior.lk
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Website</h3>
                    <a href="https://socialflow.innovior.lk" target="_blank" className="text-primary hover:underline">
                      https://socialflow.innovior.lk
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Agreement Acknowledgment */}
            <section>
              <div className="glass-card p-8 text-center border-primary/30">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">By Using SocialFlow, You Agree to These Terms</h3>
                <p className="text-sm text-muted-foreground">
                  Last Updated: December 1, 2025
                </p>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}