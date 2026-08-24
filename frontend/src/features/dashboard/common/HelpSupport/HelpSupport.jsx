import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiShield, FiCheckCircle } from 'react-icons/fi';
import './HelpSupport.css';

function HelpSupport() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'admin', text: 'Hello Debabrata! Welcome to Tech Monster Support. How can we help you today?', time: '10:00 AM' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMsg = {
            id: Date.now(),
            sender: 'student',
            text: inputMessage.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMsg]);
        setInputMessage('');

        // Simulated Admin Auto-reply for demonstration
        setTimeout(() => {
            setMessages(prev => [
                ...prev, 
                {
                    id: Date.now() + 1,
                    sender: 'admin',
                    text: 'Thank you for reaching out. Our support team has received your query and will assist you shortly.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }, 1500);
    };

    return (
        <motion.div 
            className="help-support-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="help-chat-box-wrapper">
                {/* Chat Header */}
                <div className="help-chat-header">
                    <div className="admin-profile-meta">
                        <div className="admin-avatar-container">
                            <FiShield className="admin-shield-icon" />
                            <span className="online-indicator"></span>
                        </div>
                        <div>
                            <h3>Tech Monster Admin Support</h3>
                            <span className="support-status">Active 24/7 • Usually replies instantly</span>
                        </div>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="help-chat-messages">
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id} 
                            className={`help-msg-bubble-wrapper ${msg.sender === 'student' ? 'sent' : 'received'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="help-msg-bubble">
                                <p>{msg.text}</p>
                                <div className="help-msg-meta">
                                    <span>{msg.time}</span>
                                    {msg.sender === 'student' && <FiCheckCircle className="help-read-check" />}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <form className="help-chat-input-area" onSubmit={handleSendMessage}>
                    <input 
                        type="text" 
                        placeholder="Type your problem or question here..." 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <motion.button 
                        type="submit" 
                        className="help-send-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiSend />
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
}

export default HelpSupport;