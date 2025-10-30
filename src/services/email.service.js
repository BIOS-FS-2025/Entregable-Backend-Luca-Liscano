import axios from "axios";

export const sendByEmailJS = async (email, options, templateId) => {
  // Implementación para enviar email usando EmailJS
  const data = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: templateId,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      email: email,
      ...options
    }
  }

  try {
    const response = await axios.post(process.env.EMAILJS_API_URL, data);
    console.log("Email enviado via EmailJS:", response.data);
  } catch (error) {
    console.error("Error sending email via EmailJS:", error);
  }
} 