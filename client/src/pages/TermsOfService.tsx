import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsOfService() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Terms Content */}
      <div className="flex w-full flex-col justify-start px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-3xl">
          {/* Back Link */}
          <Link
            to="/register"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign Up
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Effective Date: December 1, 2025 • Last Updated: December 1, 2025
                </p>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              
              {/* 1. Acceptance of Terms */}
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using SocialFlow (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  These Terms apply to all users of the Service, including but not limited to users who are also contributors of content, information, and other materials or services on the Service.
                </p>
              </section>

              {/* 2. Description of Service */}
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  SocialFlow provides a social media management platform that enables users to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Schedule and publish content across multiple social media platforms</li>
                  <li>Manage social media accounts (LinkedIn, Facebook, Instagram, Twitter, YouTube, WhatsApp Business)</li>
                  <li>Access analytics and reporting tools</li>
                  <li>Collaborate with team members</li>
                  <li>Store and organize media assets</li>
                </ul>
              </section>

              {/* 3. User Accounts */}
              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                
                <h3 className="text-lg font-medium mb-2">Account Creation</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  To use the Service, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.
                </p>

                <h3 className="text-lg font-medium mb-2">Account Responsibility</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must notify us immediately of any unauthorized use</li>
                  <li>You must be at least 18 years old to use the Service</li>
                  <li>You may not share your account with others</li>
                </ul>
              </section>

              {/* 4. Acceptable Use Policy */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Acceptable Use Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-2 font-medium">
                  You agree NOT to use the Service to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Post spam, malware, or malicious content</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Impersonate any person or entity</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Scrape or harvest data from the Service</li>
                </ul>
              </section>

              {/* 5. Third-Party Platform Compliance */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Third-Party Platform Compliance</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  When using SocialFlow to manage third-party social media accounts, you must comply with the terms of service and policies of each platform:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Meta (Facebook & Instagram):</strong> <a href="https://www.facebook.com/terms.php" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Meta Terms of Service</a></li>
                  <li><strong>Twitter (X):</strong> <a href="https://twitter.com/en/tos" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Twitter Terms of Service</a></li>
                  <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/legal/user-agreement" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">LinkedIn User Agreement</a></li>
                  <li><strong>YouTube:</strong> <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">YouTube Terms of Service</a></li>
                  <li><strong>WhatsApp Business:</strong> <a href="https://www.whatsapp.com/legal/business-terms" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">WhatsApp Business Terms</a></li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3 text-sm italic">
                  ⚠️ Violation of third-party platform policies may result in suspension or termination of your SocialFlow account.
                </p>
              </section>

              {/* 6. Subscription and Payment */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Subscription and Payment</h2>
                
                <h3 className="text-lg font-medium mb-2">Billing</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
                  <li>Free plan available with limited features</li>
                  <li>Paid plans billed monthly or annually</li>
                  <li>All fees are non-refundable unless required by law</li>
                  <li>Prices may change with 30 days notice</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">Cancellation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may cancel your subscription at any time. Your account will remain active until the end of your current billing period. No refunds will be issued for partial months.
                </p>
              </section>

              {/* 7. Intellectual Property */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Intellectual Property Rights</h2>
                
                <h3 className="text-lg font-medium mb-2">Your Content</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You retain all rights to the content you upload or create using the Service. By using the Service, you grant us a limited license to store, display, and transmit your content solely to provide the Service.
                </p>

                <h3 className="text-lg font-medium mb-2">Our Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Service, including its design, features, and underlying technology, is owned by SocialFlow and protected by intellectual property laws. You may not copy, modify, or reverse engineer any part of the Service.
                </p>
              </section>

              {/* 8. Limitation of Liability */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-2 uppercase text-xs font-semibold">
                  Important Legal Notice
                </p>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, SOCIALFLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Your use or inability to use the Service</li>
                  <li>Unauthorized access to your account or data</li>
                  <li>Content posted by third parties</li>
                  <li>Service interruptions or errors</li>
                  <li>Loss of social media accounts or data</li>
                </ul>
              </section>

              {/* 9. Warranty Disclaimer */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Warranty Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>
              </section>

              {/* 10. Termination */}
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We reserve the right to suspend or terminate your account at any time for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Non-payment of fees</li>
                  <li>Request by law enforcement or government agencies</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  Upon termination, your right to use the Service will immediately cease. We may delete your data after 30 days.
                </p>
              </section>

              {/* 11. Governing Law */}
              <section>
                <h2 className="text-xl font-semibold mb-3">11. Governing Law and Disputes</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of [Arbitration Body].
                </p>
              </section>

              {/* 12. Changes to Terms */}
              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* 13. Contact */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-sm"><strong>Email:</strong> <a href="mailto:legal@socialflow.com" className="text-violet-600 hover:underline">legal@socialflow.com</a></p>
                  <p className="text-sm"><strong>Website:</strong> <a href="https://socialflow.com" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">https://socialflow.com</a></p>
                </div>
              </section>

            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right Side - Image (Same as Privacy Policy) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-white/20">
            <img
              src="https://raw.githubusercontent.com/J33WAKASUPUN/Social-Media-Marketing-platform-V.2.0.0/main/social%20flow.png"
              alt="SocialFlow Platform"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 via-transparent to-transparent"></div>
          </div>

          <div className="mt-10 text-center max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4">
              Clear Terms, Fair Usage
            </h2>
            <p className="text-lg text-violet-100/90">
              We believe in transparency. Read our terms to understand your rights and responsibilities.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Clear Terms', 'Fair Usage', 'User Protection'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium border border-white/20"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}