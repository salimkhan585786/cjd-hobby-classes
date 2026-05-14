import emailjs from '@emailjs/browser';

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export const sendInquiryEmail = async (payload) => {
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured. Inquiry email will not be sent.');
    return null;
  }

  return emailjs.send(serviceId, templateId, payload, publicKey);
};

export const sendReplyEmail = async (payload) => {
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not configured. Reply email will not be sent.');
    return null;
  }

  return emailjs.send(serviceId, templateId, payload, publicKey);
};
