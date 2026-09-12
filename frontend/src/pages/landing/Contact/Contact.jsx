import "./Contact.css";

import { contactInfo, validationRules, fields } from "./ContactData";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

import BackButton from "../../../components/ui/Button/BackButton/BackButton";
import SectionHeader from "../../../components/ui/SectionHeader";
import PublicButton from "../../../components/ui/Button/PublicButton";
import Form from "../../../components/ui/Form";

import {
  validateField,
  validateForm
} from "../../../shared/utils/validation/formValidation";


function Contact() {

  const location = useLocation();

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });


  const handleInputChange = (event) => {

    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(
        name,
        value,
        validationRules
      )
    }));

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    const {
      errors: newErrors,
      isValid
    } = validateForm(
      form,
      validationRules
    );

    setErrors(newErrors);

    if (!isValid) {
      return;
    }


    try {

      await emailjs.send(
        import.meta.env.VITE_MY_GMAIL_SERVICE_ID,
        import.meta.env.VITE_MY_GMAIL_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message
        },
        import.meta.env.VITE_MY_GMAIL_PUBLIC_KEY
      );
      toast.success("Message sent successfully!");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });

      setErrors({});

    } catch (err) {

      console.error("EmailJS Error:", err);
      toast.error(
        err?.text || "Failed to send message"
      );
    }

  };

  const actions = [
    {
      component: PublicButton,
      type: "submit",
      variant: "primary",
      size: "medium",
      label: "Send Message"
    }
  ];


  return (

    <section
      className="section"
      data-section="contact"
    >

      <div className="contact-page">
        {location.pathname === "/contact" && (
          <BackButton
            to="/"
            label="Back to Landing Page"
            className="contact-back-button"
          />
        )}


        <SectionHeader
          badge="CONTACT US"
          title="Let's Build Your Skills Together"
          description="Have questions? Contact our team. We are always happy to help."
        />

        <div className="contact-container">
          <motion.div
            className="contact-info"
            initial={{
              opacity: 0,
              x: -40
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
          >

            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="info-card"
                  onClick={() =>
                    window.open(
                      item.action,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <Icon className="info-icon" />
                  <div className="info-content">
                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.value}
                    </p>

                  </div>

                </div>

              );

            })}

          </motion.div>


          <motion.div
            className="contact-form"
            initial={{
              opacity: 0,
              x: 40
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
          >

            <Form
              fields={fields}
              values={form}
              errors={errors}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              actions={actions}
              buttonComponent={PublicButton}
              formClassName="contact-form-fields"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;