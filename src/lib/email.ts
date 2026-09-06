import emailjs from '@emailjs/browser';

const EMAILJS_PUBLIC_KEY = 'tVT6SVrf-_oAAKLsd';
const EMAILJS_SERVICE_ID = 'service_9uswp1f';

// Template IDs from EmailJS Dashboard
export const TEMPLATE_ID_PENDING = 'template_ll3dhlf'; 
export const TEMPLATE_ID_CONFIRMED = 'template_xr97ztq';

export const sendPendingEmail = async (customerName: string, customerEmail: string) => {
  if (!customerEmail) return;
  
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_ID_PENDING,
      {
        to_email: customerEmail,
        client_name: customerName,
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log("Pending email sent to", customerEmail);
  } catch (error) {
    console.error("Failed to send pending email:", error);
  }
};

export const sendConfirmationEmail = async (customerName: string, customerEmail: string) => {
  if (!customerEmail) return;
  
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_ID_CONFIRMED,
      {
        to_email: customerEmail,
        client_name: customerName,
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log("Confirmation email sent to", customerEmail);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
};
