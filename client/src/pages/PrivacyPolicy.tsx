import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Policy Content */}
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
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Effective Date: December 1, 2025 • Last Updated: December 1, 2025
                </p>
              </div>
            </div>
          </div>

          {/* Policy Content */}
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              {/* 1. Introduction */}
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to SocialFlow ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media marketing platform and related services (the "Service").
                </p>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  By accessing or using SocialFlow, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this policy, please do not use the Service.
                </p>
              </section>

              {/* 2. Information We Collect */}
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We collect information that you provide to us directly, information collected automatically, and information from third-party sources.
                </p>

                <h3 className="text-lg font-medium mb-2">A. Information You Provide</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, password, and contact details when you register.</li>
                  {/* <li><strong>Billing Information:</strong> Payment details and billing address for subscription services.</li> */}
                  <li><strong>Support Data:</strong> Information you provide when contacting our customer support team.</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">B. Information Collected Automatically</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Usage Data:</strong> Log files, IP address, browser type, device information, and pages visited within our app.</li>
                  <li><strong>Cookies and Tracking:</strong> We use cookies to maintain your session and preferences.</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">C. Information from Third-Party Social Media Platforms</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  To provide our Service, SocialFlow connects with various social media platforms via their APIs (Application Programming Interfaces). When you link your accounts, we collect and process data based on the permissions you grant:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Meta (Facebook & Instagram):</strong> Page IDs, posts, comments, insights, and ad account data.</li>
                  <li><strong>Twitter (X):</strong> Tweets, timelines, profile information, and analytics data.</li>
                  <li><strong>LinkedIn:</strong> Company page data, posts, follower statistics, and engagement metrics.</li>
                  <li><strong>YouTube:</strong> Video content, channel statistics, and comments.</li>
                  <li><strong>WhatsApp:</strong> Business profile information, message templates, and chat history (processed via WhatsApp Business API).</li>
                </ul>
              </section>

              {/* 3. How We Use Your Information */}
              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>To Provide the Service:</strong> Managing your social media accounts, scheduling posts, and aggregating analytics.</li>
                  <li><strong>To Improve Our App:</strong> Analyzing usage patterns to enhance user experience.</li>
                  <li><strong>To Communicate:</strong> Sending administrative information, updates, and security alerts.</li>
                  <li><strong>To Comply with Legal Obligations:</strong> Adhering to API terms of service and applicable laws.</li>
                </ul>
              </section>

              {/* 4. Third-Party Social Media Platform Policies */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Third-Party Social Media Platform Policies</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  SocialFlow uses the API services of third-party platforms. By using our Service, you acknowledge and agree that you are also bound by the privacy policies and terms of service of these third-party platforms:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>YouTube:</strong> We use YouTube API Services. By using SocialFlow to manage YouTube content, you agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">YouTube Terms of Service</a>. Please review the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Google Privacy Policy</a>. You can revoke our access to your data via the <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Google Security Settings</a> page.</li>
                  <li><strong>Meta (Facebook & Instagram):</strong> Data is processed in accordance with the <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Meta Privacy Policy</a>.</li>
                  <li><strong>Twitter (X):</strong> Data is processed in accordance with the <a href="https://twitter.com/en/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Twitter Privacy Policy</a>.</li>
                  <li><strong>LinkedIn:</strong> Data is processed in accordance with the <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">LinkedIn Privacy Policy</a>.</li>
                  <li><strong>WhatsApp:</strong> Data is processed in accordance with the <a href="https://www.whatsapp.com/legal/business-terms" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">WhatsApp Business Terms</a>.</li>
                </ul>
              </section>

              {/* 5. YouTube API Services Data Handling */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. YouTube API Services Data Handling</h2>
                <p className="text-sm text-muted-foreground italic mb-2">(Mandatory Section for YouTube Compliance)</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Data Collection:</strong> We access your YouTube channel's data (videos, comments, analytics) solely to provide dashboard insights and scheduling features.</li>
                  <li><strong>Data Usage:</strong> We do not sell your YouTube API data to third parties. We do not use this data for advertising purposes.</li>
                  <li><strong>Data Retention:</strong> We retain YouTube data for no longer than 30 days to ensure performance, after which it is refreshed from the API.</li>
                  <li><strong>Device Data:</strong> We do not collect or store biometric data or precise geolocation data from your device related to YouTube services.</li>
                </ul>
              </section>

              {/* 6. How We Share Your Information */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. How We Share Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We do not sell your personal data. We may share information in the following situations:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Service Providers:</strong> With third-party vendors who provide hosting, email delivery, and customer service (e.g., AWS, Stripe).</li>
                  <li><strong>Legal Requirements:</strong> If required to do so by law or in response to valid requests by public authorities.</li>
                  <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition.</li>
                </ul>
              </section>

              {/* 7. International Data Transfers */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information, including personal data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ. If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there.
                </p>
              </section>

              {/* 8. Data Retention and Deletion */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Data Retention and Deletion</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We retain your personal information only as long as necessary to provide the Service and for legitimate business purposes.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Social Media Data:</strong> We regularly refresh data from APIs. If you disconnect a social media account, we delete the associated tokens and cached data from our servers immediately or within 30 days.</li>
                  <li><strong>Account Deletion:</strong> You may request the deletion of your account and all associated data by contacting us or using the "Delete Account" feature in your settings.</li>
                </ul>
              </section>

              {/* 9. Your Data Protection Rights */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Your Data Protection Rights (GDPR & CCPA)</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                  <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                  <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data ("Right to be Forgotten").</li>
                  <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
                  <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  To exercise these rights, please contact us at support@socialflow.com.
                </p>
              </section>

              {/* 10. Security */}
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use administrative, technical, and physical security measures to help protect your personal information. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                </p>
              </section>

              {/* 11. Changes to This Privacy Policy */}
              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </section>

              {/* 12. Contact Us */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  If you have questions or comments about this policy, you may contact us at:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-sm"><strong>Email:</strong> <a href="mailto:dev@innovior.lk" className="text-violet-600 hover:underline">support@socialflow.com</a></p>
                  <p className="text-sm"><strong>Website:</strong> <a href="https://socialflow.innovior.lk" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">https://socialflow.com</a></p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right Side - Image (Same as Register) */}
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
              Your Privacy Matters
            </h2>
            <p className="text-lg text-violet-100/90">
              We're committed to protecting your data and being transparent about how we use it.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['GDPR Compliant', 'Secure by Design', 'Transparent'].map((feature) => (
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