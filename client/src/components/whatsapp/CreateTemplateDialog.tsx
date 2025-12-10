import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTemplateData) => Promise<void>;
  channelId: string;
}

interface CreateTemplateData {
  channelId: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    buttons?: Array<{
      type: string;
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  channelId,
}: CreateTemplateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTemplateData>({
    channelId,
    name: '',
    language: 'en',
    category: 'UTILITY',
    components: [
      { type: 'BODY', text: '' }
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const bodyComponent = formData.components.find(c => c.type === 'BODY');
    if (!bodyComponent?.text?.trim()) {
      toast.error('Template body is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        channelId,
        name: '',
        language: 'en',
        category: 'UTILITY',
        components: [{ type: 'BODY', text: '' }],
      });
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const updateComponent = (index: number, updates: any) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], ...updates };
    setFormData({ ...formData, components: newComponents });
  };

  const addComponent = (type: 'HEADER' | 'FOOTER' | 'BUTTONS') => {
    // Check if component type already exists
    if (formData.components.some(c => c.type === type)) {
      toast.error(`${type} already exists`);
      return;
    }

    const newComponent: any = { type };
    if (type === 'HEADER') {
      newComponent.format = 'TEXT';
      newComponent.text = '';
    } else if (type === 'FOOTER') {
      newComponent.text = '';
    } else if (type === 'BUTTONS') {
      newComponent.buttons = [];
    }

    setFormData({
      ...formData,
      components: [...formData.components, newComponent],
    });
  };

  const removeComponent = (index: number) => {
    // Can't remove BODY component
    if (formData.components[index].type === 'BODY') {
      toast.error('Body component is required');
      return;
    }

    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index),
    });
  };

  const addButton = (componentIndex: number) => {
    const component = formData.components[componentIndex];
    if (component.type !== 'BUTTONS') return;

    const buttons = component.buttons || [];
    if (buttons.length >= 3) {
      toast.error('Maximum 3 buttons allowed');
      return;
    }

    updateComponent(componentIndex, {
      buttons: [...buttons, { type: 'URL', text: '', url: '' }],
    });
  };

  const updateButton = (componentIndex: number, buttonIndex: number, updates: any) => {
    const component = formData.components[componentIndex];
    if (component.type !== 'BUTTONS' || !component.buttons) return;

    const newButtons = [...component.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], ...updates };
    updateComponent(componentIndex, { buttons: newButtons });
  };

  const removeButton = (componentIndex: number, buttonIndex: number) => {
    const component = formData.components[componentIndex];
    if (component.type !== 'BUTTONS' || !component.buttons) return;

    updateComponent(componentIndex, {
      buttons: component.buttons.filter((_, i) => i !== buttonIndex),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create WhatsApp Template</DialogTitle>
            <DialogDescription>
              Templates must be approved by WhatsApp before use. Follow guidelines carefully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="order_confirmation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use lowercase and underscores only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="UTILITY">Utility</SelectItem>
                  <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Marketing templates require opt-in. Utility templates are for transactional messages.
              </p>
            </div>

            {/* Components */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Template Components</Label>
                <div className="flex gap-2">
                  {!formData.components.some(c => c.type === 'HEADER') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addComponent('HEADER')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Header
                    </Button>
                  )}
                  {!formData.components.some(c => c.type === 'FOOTER') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addComponent('FOOTER')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Footer
                    </Button>
                  )}
                  {!formData.components.some(c => c.type === 'BUTTONS') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addComponent('BUTTONS')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Buttons
                    </Button>
                  )}
                </div>
              </div>

              {/* Render Components */}
              <div className="space-y-3">
                {formData.components.map((component, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{component.type}</Badge>
                      {component.type !== 'BODY' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeComponent(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* HEADER */}
                    {component.type === 'HEADER' && (
                      <>
                        <Select
                          value={component.format || 'TEXT'}
                          onValueChange={(value: any) => updateComponent(index, { format: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEXT">Text</SelectItem>
                            <SelectItem value="IMAGE">Image</SelectItem>
                            <SelectItem value="VIDEO">Video</SelectItem>
                            <SelectItem value="DOCUMENT">Document</SelectItem>
                          </SelectContent>
                        </Select>
                        {component.format === 'TEXT' && (
                          <Input
                            placeholder="Header text"
                            value={component.text || ''}
                            onChange={(e) => updateComponent(index, { text: e.target.value })}
                            maxLength={60}
                          />
                        )}
                      </>
                    )}

                    {/* BODY */}
                    {component.type === 'BODY' && (
                      <Textarea
                        placeholder="Message body (required)"
                        value={component.text || ''}
                        onChange={(e) => updateComponent(index, { text: e.target.value })}
                        rows={4}
                        required
                        maxLength={1024}
                      />
                    )}

                    {/* FOOTER */}
                    {component.type === 'FOOTER' && (
                      <Input
                        placeholder="Footer text (optional)"
                        value={component.text || ''}
                        onChange={(e) => updateComponent(index, { text: e.target.value })}
                        maxLength={60}
                      />
                    )}

                    {/* BUTTONS */}
                    {component.type === 'BUTTONS' && (
                      <div className="space-y-2">
                        {component.buttons?.map((button, btnIndex) => (
                          <div key={btnIndex} className="flex gap-2">
                            <Select
                              value={button.type}
                              onValueChange={(value) => updateButton(index, btnIndex, { type: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="URL">URL</SelectItem>
                                <SelectItem value="PHONE_NUMBER">Phone</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Button text"
                              value={button.text}
                              onChange={(e) => updateButton(index, btnIndex, { text: e.target.value })}
                              maxLength={20}
                            />
                            {button.type === 'URL' && (
                              <Input
                                placeholder="https://example.com"
                                value={button.url || ''}
                                onChange={(e) => updateButton(index, btnIndex, { url: e.target.value })}
                              />
                            )}
                            {button.type === 'PHONE_NUMBER' && (
                              <Input
                                placeholder="+1234567890"
                                value={button.phone_number || ''}
                                onChange={(e) => updateButton(index, btnIndex, { phone_number: e.target.value })}
                              />
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeButton(index, btnIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {(!component.buttons || component.buttons.length < 3) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addButton(index)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Button
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Guidelines Alert */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>WhatsApp Template Guidelines:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Templates are reviewed and must be approved before use</li>
                  <li>Marketing templates require user opt-in</li>
                  <li>Avoid promotional content in utility templates</li>
                  <li>Variables must be clearly indicated with {'{{'}{'{'}1{'}'}{'}'}</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}