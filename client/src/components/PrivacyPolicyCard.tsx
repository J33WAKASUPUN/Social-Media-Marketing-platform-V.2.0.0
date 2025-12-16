import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, FileText, ExternalLink, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PrivacyPolicyCard() {
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);

  const handleDownloadPDF = () => {
    // You can implement PDF download functionality here
    window.print(); // For now, use browser print to save as PDF
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>
                Review how we protect and handle your data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-xs text-muted-foreground">December 1, 2025</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                GDPR Compliant
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Data Protection</p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">Encrypted</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Your Rights</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium">Guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => setShowPolicyDialog(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Full Policy
            </Button>
            {/* <Button 
              variant="outline"
              onClick={() => window.open('/privacy-policy', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button> */}
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            We're committed to protecting your privacy and being transparent about our data practices.
          </p>
        </CardContent>
      </Card>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <DialogTitle>Privacy Policy</DialogTitle>
                  <DialogDescription>
                    Effective Date: December 1, 2025 • Last Updated: December 1, 2025
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="shrink-0"
              >
            <Download className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-200px)] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              
              {/* 1. Introduction */}
              <section>
                <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Welcome to SocialFlow ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media marketing platform and related services (the "Service").
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                  By accessing or using SocialFlow, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this policy, please do not use the Service.
                </p>
              </section>

              {/* 2. Information We Collect */}
              <section>
                <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
                
                <h3 className="text-base font-medium mb-2 mt-3">A. Information You Provide</h3>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, password, and contact details when you register.</li>
                  <li><strong>Support Data:</strong> Information you provide when contacting our customer support team.</li>
                </ul>

                <h3 className="text-base font-medium mb-2 mt-3">B. Information Collected Automatically</h3>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li><strong>Usage Data:</strong> Log files, IP address, browser type, device information, and pages visited.</li>
                  <li><strong>Cookies:</strong> We use cookies to maintain your session and preferences.</li>
                </ul>

                <h3 className="text-base font-medium mb-2 mt-3">C. Third-Party Social Media Data</h3>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li><strong>Meta (Facebook & Instagram):</strong> Page data, posts, insights</li>
                  <li><strong>Twitter (X):</strong> Tweets, profile information, analytics</li>
                  <li><strong>LinkedIn:</strong> Company page data, posts, follower statistics</li>
                  <li><strong>YouTube:</strong> Video content, channel statistics</li>
                  <li><strong>WhatsApp:</strong> Business profile, message templates</li>
                </ul>
              </section>

              {/* 3. How We Use Your Information */}
              <section>
                <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li>To provide and maintain the Service</li>
                  <li>To schedule and publish social media posts</li>
                  <li>To aggregate analytics from multiple platforms</li>
                  <li>To send administrative updates and security alerts</li>
                  <li>To improve user experience and develop new features</li>
                </ul>
              </section>

              {/* 4. Data Sharing */}
              <section>
                <h2 className="text-lg font-semibold mb-2">4. How We Share Your Information</h2>
                <p className="text-muted-foreground text-sm font-semibold mb-2">
                  We do NOT sell your personal data.
                </p>
                <p className="text-muted-foreground text-sm mb-2">We may share information with:</p>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li><strong>Service Providers:</strong> AWS, email delivery, payment processors</li>
                  <li><strong>Legal Requirements:</strong> If required by law or to protect rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
                </ul>
              </section>

              {/* 5. Data Retention */}
              <section>
                <h2 className="text-lg font-semibold mb-2">5. Data Retention & Deletion</h2>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li><strong>Social Media Data:</strong> Refreshed regularly from APIs. Disconnecting an account deletes tokens and cached data within 30 days.</li>
                  <li><strong>Account Deletion:</strong> Request deletion via settings or contact support@socialflow.com</li>
                </ul>
              </section>

              {/* 6. Your Rights (GDPR & CCPA) */}
              <section>
                <h2 className="text-lg font-semibold mb-2">6. Your Data Protection Rights</h2>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li><strong>Access:</strong> Request a copy of your data</li>
                  <li><strong>Correction:</strong> Update incorrect information</li>
                  <li><strong>Deletion:</strong> Request account deletion (Right to be Forgotten)</li>
                  <li><strong>Portability:</strong> Export your data</li>
                  <li><strong>Restrict Processing:</strong> Limit how we process your data</li>
                </ul>
                <p className="text-muted-foreground text-sm mt-2">
                  To exercise these rights: <a href="mailto:support@socialflow.com" className="text-primary hover:underline">support@socialflow.com</a>
                </p>
              </section>

              {/* 7. Security */}
              <section>
                <h2 className="text-lg font-semibold mb-2">7. Security</h2>
                <p className="text-muted-foreground text-sm">
                  We use industry-standard encryption, secure servers, and regular security audits. However, no system is 100% secure. We continuously improve our security measures.
                </p>
              </section>

              {/* 8. YouTube API Compliance */}
              <section>
                <h2 className="text-lg font-semibold mb-2">8. YouTube API Services</h2>
                <p className="text-muted-foreground text-sm mb-2">SocialFlow uses YouTube API Services. By using our platform:</p>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li>You agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" className="text-primary hover:underline">YouTube Terms of Service</a></li>
                  <li>We only access data necessary for scheduling and analytics</li>
                  <li>We do NOT sell your YouTube data</li>
                  <li>You can revoke access via <a href="https://security.google.com/settings/security/permissions" target="_blank" className="text-primary hover:underline">Google Security Settings</a></li>
                </ul>
              </section>

              {/* 9. Contact */}
              <section>
                <h2 className="text-lg font-semibold mb-2">9. Contact Us</h2>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-sm"><strong>Email:</strong> <a href="mailto:support@socialflow.com" className="text-primary hover:underline">support@socialflow.com</a></p>
                  <p className="text-sm"><strong>Website:</strong> <a href="https://socialflow-home.onrender.com" target="_blank" className="text-primary hover:underline">https://socialflow.com</a></p>
                </div>
              </section>

            </div>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: December 1, 2025
            </p>
            <Button onClick={() => setShowPolicyDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}