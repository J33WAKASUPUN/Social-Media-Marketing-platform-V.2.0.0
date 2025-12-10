import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatsAppTemplate } from '@/types';
import { Send, Trash2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: WhatsAppTemplate;
  onSend: (template: WhatsAppTemplate) => void;
  onDelete: (templateId: string) => void;
  onPreview: (template: WhatsAppTemplate) => void;
}

export function TemplateCard({
  template,
  onSend,
  onDelete,
  onPreview,
}: TemplateCardProps) {
  const statusConfig = {
    APPROVED: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    PENDING: { icon: Clock, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    REJECTED: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  };

  const categoryConfig = {
    MARKETING: { label: 'Marketing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    UTILITY: { label: 'Utility', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    AUTHENTICATION: { label: 'Auth', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  };

  const status = statusConfig[template.status];
  const category = categoryConfig[template.category];
  const StatusIcon = status.icon;

  // Get template preview text
  const getPreviewText = () => {
    const bodyComponent = template.components.find(c => c.type === 'BODY');
    return bodyComponent?.text || 'No content';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{template.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Language: {template.language.toUpperCase()}
            </p>
          </div>
          <div className="flex gap-2 ml-2">
            <Badge variant="outline" className={cn('text-xs', category.color)}>
              {category.label}
            </Badge>
            <Badge variant="outline" className={cn('text-xs flex items-center gap-1', status.color)}>
              <StatusIcon className="h-3 w-3" />
              {template.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Template Preview */}
        <div className="bg-muted/50 rounded-lg p-3 min-h-[60px]">
          <p className="text-sm line-clamp-3 text-muted-foreground">
            {getPreviewText()}
          </p>
        </div>

        {/* Components Summary */}
        <div className="flex flex-wrap gap-2 mt-3">
          {template.components.map((comp, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {comp.type}
              {comp.format && ` (${comp.format})`}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(template)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        {template.status === 'APPROVED' && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onSend(template)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(template._id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}