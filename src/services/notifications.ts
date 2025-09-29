// WhatsApp Redirect Notification Service
export interface NotificationData {
  mobile: string;
  message: string;
  type: 'welcome' | 'fee_confirmation' | 'fee_reminder' | 'goodbye';
}

// WhatsApp redirect function
export const sendWhatsAppMessage = (mobile: string, message: string): void => {
  // Format mobile number (remove any non-digits and add country code if needed)
  let formattedMobile = mobile.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  if (formattedMobile.length === 10) {
    formattedMobile = '91' + formattedMobile;
  }
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedMobile}?text=${encodedMessage}`;
  
  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank');
  
  console.log(`Opening WhatsApp for ${mobile} with message: ${message}`);
};

// Bulk WhatsApp redirect function
export const sendBulkWhatsAppMessages = (contacts: Array<{mobile: string, name: string}>, message: string): void => {
  contacts.forEach((contact, index) => {
    // Add delay between opening tabs to avoid browser blocking
    setTimeout(() => {
      const personalizedMessage = message.replace('{name}', contact.name);
      sendWhatsAppMessage(contact.mobile, personalizedMessage);
    }, index * 1000); // 1 second delay between each
  });
};

// Message templates
export const getWelcomeMessage = (studentName: string, seatNumber?: number): string => {
  return `Welcome to our library, ${studentName}! ${seatNumber ? `Your seat number is ${seatNumber}.` : ''} We're excited to have you with us. For any queries, contact us.`;
};

export const getFeeConfirmationMessage = (studentName: string, amount: number, expiryDate: string): string => {
  return `Dear ${studentName}, your fee payment of ₹${amount} has been received successfully. Your membership is valid till ${expiryDate}. Thank you!`;
};

export const getFeeReminderMessage = (studentName: string, expiryDate: string): string => {
  return `Dear ${studentName}, your library membership expires on ${expiryDate}. Please renew your fees to continue using our services. Thank you!`;
};

export const getGoodbyeMessage = (studentName: string): string => {
  return `Dear ${studentName}, thank you for being part of our library family. We hope to see you again soon. Best wishes for your future endeavors!`;
};

// Custom message with name placeholder
export const getCustomMessage = (template: string, studentName: string): string => {
  return template.replace(/{name}/g, studentName);
};

// Notification logging (for tracking purposes)
export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  mobile: string;
  type: 'welcome' | 'fee_confirmation' | 'fee_reminder' | 'goodbye' | 'custom';
  message: string;
  sentAt: string;
  method: 'whatsapp_redirect';
}

let notificationLogs: NotificationLog[] = [];

export const logNotification = (
  studentId: string,
  studentName: string,
  mobile: string,
  type: NotificationLog['type'],
  message: string
): NotificationLog => {
  const log: NotificationLog = {
    id: Date.now().toString(),
    studentId,
    studentName,
    mobile,
    type,
    message,
    sentAt: new Date().toISOString(),
    method: 'whatsapp_redirect'
  };
  
  notificationLogs.unshift(log);
  
  // Keep only last 100 notifications
  if (notificationLogs.length > 100) {
    notificationLogs = notificationLogs.slice(0, 100);
  }
  
  return log;
};

export const getNotificationLogs = (): NotificationLog[] => {
  return notificationLogs;
};

export const clearNotificationLogs = (): void => {
  notificationLogs = [];
};