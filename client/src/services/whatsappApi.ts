import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, WhatsAppContact, WhatsAppMessage, WhatsAppTemplate } from '@/types';

export const whatsappApi = {
  // ============================================
  // CONNECTION
  // ============================================
  
  /**
   * Connect WhatsApp Business Account
   */
  connect: async (data: {
    brandId: string;
    phoneNumberId: string;
    businessAccountId: string;
    accessToken: string;
  }) => {
    const response = await api.post<ApiResponse<any>>('/whatsapp/connect', data);
    return response.data;
  },

  // ============================================
  // TEMPLATES
  // ============================================
  
  /**
   * Get all templates
   */
  getTemplates: async (brandId: string, channelId?: string) => {
    const response = await api.get<ApiResponse<WhatsAppTemplate[]>>('/whatsapp/templates', {
      params: { brandId, channelId },
    });
    return response.data;
  },

  /**
   * Create new template
   */
  createTemplate: async (data: {
    brandId: string;
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
  }) => {
    const response = await api.post<ApiResponse<WhatsAppTemplate>>('/whatsapp/templates', data);
    return response.data;
  },

  /**
   * Delete template
   */
  deleteTemplate: async (templateId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/whatsapp/templates/${templateId}`);
    return response.data;
  },

  // ============================================
  // CONTACTS
  // ============================================
  
  /**
   * Get all contacts
   */
  getContacts: async (brandId: string, filters?: {
    tags?: string[];
    search?: string;
    groups?: string[];
  }) => {
    const response = await api.get<ApiResponse<WhatsAppContact[]>>('/whatsapp/contacts', {
      params: { brandId, ...filters },
    });
    return response.data;
  },

  /**
   * Create new contact
   */
  createContact: async (data: {
    brandId: string;
    name: string;
    phone: string;
    email?: string;
    tags?: string[];
    groups?: string[];
    customFields?: Record<string, string>;
    notes?: string;
  }) => {
    const response = await api.post<ApiResponse<WhatsAppContact>>('/whatsapp/contacts', data);
    return response.data;
  },

  /**
   * Update contact
   */
  updateContact: async (contactId: string, data: Partial<WhatsAppContact>) => {
    const response = await api.patch<ApiResponse<WhatsAppContact>>(
      `/whatsapp/contacts/${contactId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete contact
   */
  deleteContact: async (contactId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/whatsapp/contacts/${contactId}`);
    return response.data;
  },

  // ============================================
  // MESSAGING
  // ============================================
  
  /**
   * Send text message
   */
  sendText: async (data: {
    channelId: string;
    recipientIds: string[];
    text: string;
    previewUrl?: boolean;
  }) => {
    const response = await api.post<ApiResponse<{
      results: Array<{
        recipient: string;
        success: boolean;
        messageId?: string;
        error?: string;
      }>;
      summary: {
        total: number;
        success: number;
        failed: number;
      };
    }>>('/whatsapp/send-text', data);
    return response.data;
  },

  /**
   * Send media message (image, video, document, audio)
   */
  sendMedia: async (data: {
    channelId: string;
    recipientIds: string[];
    mediaType: 'image' | 'video' | 'document' | 'audio';
    mediaUrl: string;
    caption?: string;
  }) => {
    const response = await api.post<ApiResponse<{
      results: Array<{
        recipient: string;
        success: boolean;
        messageId?: string;
        error?: string;
      }>;
      summary: {
        total: number;
        success: number;
        failed: number;
      };
    }>>('/whatsapp/send-media', data);
    return response.data;
  },

  /**
   * Send template message
   */
sendTemplate: async (brandId: string, data: {
  channelId: string;
  templateName: string;
  languageCode?: string;
  recipientIds: string[];
  components?: any[];
}) => {
  const payload = {
    channelId: data.channelId,
    templateName: data.templateName,
    languageCode: data.languageCode || 'en',
    recipientIds: Array.isArray(data.recipientIds) ? data.recipientIds : [data.recipientIds],
    components: data.components || [],
  };

  const response = await api.post<ApiResponse<{
    results: Array<{
      recipient: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
    summary: {
      total: number;
      success: number;
      failed: number;
    };
  }>>('/whatsapp/send-template', payload);
  
  return response.data;
},

/**
 * Send text message (unified method for Inbox)
 */
sendMessage: async (brandId: string, data: {
  to: string;
  type: 'text';
  text: string;
}) => {
  // Get WhatsApp channel for this brand
  const channelsRes = await api.get<ApiResponse<any>>('/channels', {
    params: { brandId },
  });
  
  const whatsappChannel = channelsRes.data.data.find(
    (ch: any) => ch.provider === 'whatsapp' && ch.connectionStatus === 'active'
  );

  if (!whatsappChannel) {
    throw new Error('No active WhatsApp channel found');
  }

  // Use sendText API
  const response = await api.post<ApiResponse<{
    results: Array<{
      recipient: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }>>('/whatsapp/send-text', {
    channelId: whatsappChannel._id,
    recipientIds: [data.to], // Send by phone number directly
    text: data.text,
  });

  return response.data;
},

/**
 * Send media message (unified method for Inbox)
 */
sendMediaMessage: async (brandId: string, formData: FormData) => {
  // For now, this would need file upload support
  // We'll use the sendMedia endpoint with URL
  throw new Error('Media upload not yet implemented. Use Media Library URLs instead.');
},

  // ============================================
  // MESSAGE HISTORY
  // ============================================
  
/**
 * Get message history
 */
getMessages: async (brandId: string, filters?: {
  phoneNumberId?: string;
  contactPhone?: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template' | 'call';
  limit?: number;
  page?: number;
}) => {
  const params: Record<string, any> = { 
    brandId 
  };

  if (filters) {
    if (filters.phoneNumberId) params.phoneNumberId = filters.phoneNumberId;
    if (filters.contactPhone) params.contactPhone = filters.contactPhone;
    if (filters.type) params.type = filters.type;
    if (filters.limit) params.limit = filters.limit;
    if (filters.page) params.page = filters.page;
  }

  const response = await api.get<PaginatedResponse<WhatsAppMessage>>('/whatsapp/messages', {
    params,
  });
  
  return response.data;
},
};