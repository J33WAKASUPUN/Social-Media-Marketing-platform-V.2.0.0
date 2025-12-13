import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck, Globe, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
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
            <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="section-heading mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Effective Date: January 1, 2024 • Last Updated: January 1, 2024
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
              { icon: Lock, label: "Security", href: "#security" },
              { icon: Eye, label: "Data Use", href: "#data-use" },
              { icon: Database, label: "Data Retention", href: "#retention" },
              { icon: UserCheck, label: "Your Rights", href: "#rights" },
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
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400 font-bold">1</span>
                </div>
                Introduction
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to SocialFlow ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media marketing platform and related services (the "Service").
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By accessing or using SocialFlow, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this policy, please do not use the Service.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                </div>
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-3">A. Information You Provide</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Account Information:</strong> Name, email address, password, and contact details when you register.</li>
                    <li><strong>Support Data:</strong> Information you provide when contacting our customer support team.</li>
                  </ul>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-3">B. Information Collected Automatically</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Usage Data:</strong> Log files, IP address, browser type, device information, and pages visited.</li>
                    <li><strong>Cookies:</strong> We use cookies to maintain your session and preferences.</li>
                  </ul>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-3">C. Third-Party Social Media Data</h3>
                  <p className="text-muted-foreground mb-3">When you connect your social accounts, we collect:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>LinkedIn:</strong> Profile info, posts, analytics</li>
                    <li><strong>Facebook/Instagram:</strong> Page data, posts, insights</li>
                    <li><strong>Twitter:</strong> Profile, tweets, analytics</li>
                    <li><strong>YouTube:</strong> Channel data, videos, analytics</li>
                    <li><strong>WhatsApp:</strong> Business profile, message templates</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. How We Use Your Information */}
            <section id="data-use">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">3</span>
                </div>
                How We Use Your Information
              </h2>
              <div className="glass-card p-6">
                <ul className="space-y-3">
                  {[
                    "To provide and maintain the Service",
                    "To schedule and publish social media posts",
                    "To aggregate analytics from multiple platforms",
                    "To send administrative updates and security alerts",
                    "To improve user experience and develop new features",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 4. Third-Party Policies */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">4</span>
                </div>
                Third-Party Platform Policies
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4">
                  By using SocialFlow, you're also bound by these platform policies:
                </p>
                <div className="space-y-2">
                  {[
                    { name: "Meta (Facebook & Instagram)", url: "https://www.facebook.com/privacy/policy" },
                    { name: "Twitter (X)", url: "https://twitter.com/en/privacy" },
                    { name: "LinkedIn", url: "https://www.linkedin.com/legal/privacy-policy" },
                    { name: "YouTube", url: "https://policies.google.com/privacy" },
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
                        View Policy →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. YouTube Specific */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-bold">5</span>
                </div>
                YouTube API Services
              </h2>
              <div className="glass-card p-6 border-red-500/20">
                <p className="text-muted-foreground mb-4">
                  SocialFlow uses YouTube API Services. By using our platform:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" className="text-primary hover:underline">YouTube Terms of Service</a></li>
                  <li>We only access data necessary for scheduling and analytics</li>
                  <li>We do NOT sell your YouTube data</li>
                  <li>You can revoke access via <a href="https://security.google.com/settings/security/permissions" target="_blank" className="text-primary hover:underline">Google Security Settings</a></li>
                </ul>
              </div>
            </section>

            {/* 6. Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">6</span>
                </div>
                How We Share Your Information
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground mb-4 font-semibold">
                  We do NOT sell your personal data.
                </p>
                <p className="text-muted-foreground mb-3">We may share information with:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Service Providers:</strong> AWS, email delivery, payment processors</li>
                  <li><strong>Legal Requirements:</strong> If required by law or to protect rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
                </ul>
              </div>
            </section>

            {/* 7. Data Retention */}
            <section id="retention">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">7</span>
                </div>
                Data Retention & Deletion
              </h2>
              <div className="glass-card p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Social Media Data</p>
                      <p className="text-sm text-muted-foreground">
                        Refreshed regularly from APIs. Disconnecting an account deletes tokens and cached data within 30 days.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Account Deletion</p>
                      <p className="text-sm text-muted-foreground">
                        Request deletion via settings or contact support@socialflow.com
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* 8. Your Rights */}
            <section id="rights">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <span className="text-pink-600 dark:text-pink-400 font-bold">8</span>
                </div>
                Your Data Protection Rights (GDPR & CCPA)
              </h2>
              <div className="glass-card p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Access", desc: "Request a copy of your data" },
                    { title: "Correction", desc: "Update incorrect information" },
                    { title: "Deletion", desc: "Request account deletion" },
                    { title: "Portability", desc: "Export your data" },
                    { title: "Opt-Out", desc: "Unsubscribe from marketing" },
                    { title: "Revoke Access", desc: "Disconnect social accounts" },
                  ].map((right) => (
                    <div key={right.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <UserCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">{right.title}</p>
                        <p className="text-xs text-muted-foreground">{right.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  To exercise these rights: <a href="mailto:support@socialflow.com" className="text-primary hover:underline">support@socialflow.com</a>
                </p>
              </div>
            </section>

            {/* 9. Security */}
            <section id="security">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">9</span>
                </div>
                Security
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground">
                  We use industry-standard encryption, secure servers, and regular security audits. However, no system is 100% secure. We continuously improve our security measures.
                </p>
              </div>
            </section>

            {/* 10. Changes */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">10</span>
                </div>
                Changes to This Policy
              </h2>
              <div className="glass-card p-6">
                <p className="text-muted-foreground">
                  We may update this policy from time to time. We'll notify you of significant changes by email or through the Service. Continued use after changes means you accept the updated policy.
                </p>
              </div>
            </section>

            {/* 11. Contact */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-violet-600 dark:text-violet-400 font-bold">11</span>
                </div>
                Contact Us
              </h2>
              <div className="glass-card p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <a href="mailto:support@socialflow.com" className="text-primary hover:underline">
                      support@socialflow.com
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Website</h3>
                    <a href="https://socialflow.com" target="_blank" className="text-primary hover:underline">
                      https://socialflow.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust Badges */}
            <section>
              <div className="glass-card p-8 text-center">
                <h3 className="font-semibold mb-6">We're Committed to Your Privacy</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {["GDPR Compliant", "SOC 2 Certified", "256-bit SSL", "Regular Audits"].map((badge) => (
                    <div key={badge} className="px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                      ✓ {badge}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}