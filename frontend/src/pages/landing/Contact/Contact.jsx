import "./Contact.css";
import { contactInfo } from "./ContactData";
import { motion } from "framer-motion";

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

import SectionHeader from "../../../components/ui/SectionHeader";
import Button from "../../../components/ui/Button";
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/TextArea';

import BackButton from "../../../components/ui/Button/BackButton/BackButton";


function Contact() {

  const location = useLocation();

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const validateField = (name, value) => {
    let error = '';

    if (name === "name") {
      if (!value.trim()) {
        error = 'Full name is Required';
      } else if (value.trim().length < 3) {
        error = 'Name must be at least 3 character'
      }
    }

    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Enter a vaild email address';
      }
    }

    if (name === 'subject') {
      if (!value.trim()) {
        error = 'Subject field is required';
      } else if (value.trim().length < 5) {
        error = 'Subject have must be 5 characters';
      }
    }

    if (name === 'message') {
      if (!value.trim()) {
        error = 'Message is required';
      } else if (value.trim().length < 10) {
        error = 'Message must be 10 characters';
      }
    }

    return error;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors({
      ...errors,
      [name]: validateField(name, value)
    })
  }

  const validateForm = () => {
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      subject: validateField("subject", form.subject),
      message: validateField("message", form.message)
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    emailjs.send(
      import.meta.env.VITE_MY_GMAIL_SERVICE_ID,
      import.meta.env.VITE_MY_GMAIL_TEMPLATE_ID,
      {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message
      },

      import.meta.env.VITE_MY_GMAIL_PUBLIC_KEY
    ).then(() => {
      toast.success("Message sent Successfully!!")
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    })
      .catch((err) => {
        console.log(`Error: ${err}`)
        console.log(`Error: ${err.text}`)
        toast.error(err.text || "Failed to send message");
      })
  }

  return (

    <section className="section" id="contact">
      <div id="contactPage">

        {location.pathname === "/contact" && (
          <BackButton
            to="/"
            label="Back to Landing Page"
            className="contact-back-button"
          />
        )}

        <SectionHeader
          badge="CONTACT US"
          title="Let's Build Your Career Together"
          description="Have questions? Contact our team. We are always happy to help."
        />

        <div id="contact-container">

          <motion.div
            id="contact-info"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >

            {contactInfo.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.id}
                  id="info-card"
                  onClick={() => window.open(item.action, "_blank", "noopener,noreferrer")}
                >

                  <Icon id="info-icon" />

                  <div>

                    <h3>{item.title}</h3>

                    <p>{item.value}</p>

                  </div>

                </div>

              );

            })}

          </motion.div>

          <motion.form
            id="contact-form"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
          >

            <Input
              label="Name"
              type="text"
              placeholder="Enter Your name"
              name={'name'}
              value={form.name}
              onChange={handleInputChange}
              error={errors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter Your Email"
              name={'email'}
              value={form.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />

            <Input
              label="Subject"
              type="text"
              placeholder="Subject"
              name={'subject'}
              value={form.subject}
              onChange={handleInputChange}
              error={errors.subject}
              required
            />

            <Textarea
              label="Message"
              name="message"
              rows={6}
              placeholder="Write your message..."
              value={form.message}
              onChange={handleInputChange}
              error={errors.message}
            />

            <Button
              variant="primary"
              fullWidth
              type="submit"
            >
              Send Message
            </Button>

          </motion.form>

        </div>

      </div>
    </section>

  );

}

export default Contact;