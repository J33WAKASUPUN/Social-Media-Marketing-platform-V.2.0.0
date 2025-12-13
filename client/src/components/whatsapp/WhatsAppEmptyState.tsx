import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppEmptyStateProps {
  title?: string;
  description?: string;
}

export function WhatsAppEmptyState({ 
  title = "WhatsApp Not Connected",
  description = "Connect your WhatsApp Business account to view analytics, send messages, and manage contacts."
}: WhatsAppEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="border-dashed bg-muted/5 border-2 max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {description}
          </p>
          <Button 
            onClick={() => navigate('/channels')} 
            className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Connect WhatsApp
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}