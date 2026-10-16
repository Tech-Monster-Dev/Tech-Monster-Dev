import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp
} from "react-icons/fa";

export const contactInfo = [
  {
    id: 1,
    icon: FaEnvelope,
    title: "Email",
    value: "techmonsterx6@gmail.com",
    action: "https://mail.google.com/mail/?view=cm&fs=1&to=techmonsterx6@gmail.com"
  },
  {
    id: 2,
    icon: FaWhatsapp,
    title: "Whatsapp",
    value: "+91 8984457601",
    action: "https://wa.me/918984457601?text=Hello%20Tech%20Monster"
  },
  {
    id: 3,
    icon: FaMapMarkerAlt,
    title: "Address",
    value: "Bhubaneswar, Odisha",
    action: "https://www.google.com/maps/search/?api=1&query=Bhubaneswar+Odisha"
  }
];


export const validationRules = {
  name: {
    required: true,
    requiredMessage: "Full name is required",
    minLength: 3,
    minLengthMessage: "Name must be at least 3 characters"
  },

  email: {
    required: true,
    requiredMessage: "Email is required",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: "Enter a valid email address"
  },

  subject: {
    required: true,
    requiredMessage: "Subject field is required",
    minLength: 5,
    minLengthMessage: "Subject must have at least 5 characters"
  },

  message: {
    required: true,
    requiredMessage: "Message is required",
    minLength: 10,
    minLengthMessage: "Message must be at least 10 characters"
  }

};

export const fields = [
  {
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Enter your name",
    required: true
  },

  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true
  },

  {
    name: "subject",
    type: "text",
    label: "Subject",
    placeholder: "Subject",
    required: true
  },

  {
    name: "message",
    type: "textarea",
    label: "Message",
    placeholder: "Write your message...",
    rows: 6,
    required: true
  }
];