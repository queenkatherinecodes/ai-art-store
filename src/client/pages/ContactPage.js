import React, { useState, useRef } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Send, Sparkles, RefreshCw } from 'lucide-react';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';

const AIArtworkContactForm = () => {
    const [state, handleSubmit] = useForm("xeojppkp");
    const [hoverEffect, setHoverEffect] = useState(false);
    const [captchaValue, setCaptchaValue] = useState('');
    const captchaRef = useRef(null);
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const { user } = useAuth();

    React.useEffect(() => {
        loadCaptchaEnginge(6, bgColor, '#FFFFFF');
    }, []);

    if (state.succeeded) {
        return (
            <div className="ai-contact-success">
                <Sparkles size={48} className="sparkle-icon" />
                <h2>Message Sent!</h2>
                <p>Thank you for reaching out. We'll get back to you with some AI-powered creativity soon!</p>
            </div>
        );
    }

    const onSubmit = (e) => {
        e.preventDefault();
        if (validateCaptcha(captchaValue, false)) {
            handleSubmit(e);
            logService.logContactUs(user.username);
        } else {
            alert("Captcha Does Not Match");
            refreshCaptcha();
        }
    };

    const refreshCaptcha = () => {
        loadCaptchaEnginge(6, bgColor, '#FFFFFF');
        setCaptchaValue('');
        if (captchaRef.current) {
            captchaRef.current.value = "";
        }
    };

    return (
        <div className="ai-contact-container">
            <div className="ai-contact-header">
                <h1>contact ai art</h1>
                <p>we value your opinion.</p>
                <p>please share and we will train our ai model on your feedback.</p>
            </div>
            <form onSubmit={onSubmit} className="ai-contact-form">
                <div className="form-group">
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="name"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="email"
                        required
                    />
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="error-message" />
                </div>
                <div className="form-group">
                    <textarea
                        id="message"
                        name="message"
                        placeholder="message"
                        required
                    />
                    <ValidationError prefix="Message" field="message" errors={state.errors} className="error-message" />
                </div>
                <div className="captcha-group">
                    <div className="captcha-container">
                        <LoadCanvasTemplate reloadText=" "/>
                        <button type="button" className="refresh-captcha" onClick={refreshCaptcha}>
                            <RefreshCw size={18} />
                        </button>
                    </div>
                    <input
                        placeholder="captcha code"
                        ref={captchaRef}
                        onChange={(e) => setCaptchaValue(e.target.value)}
                        className="captcha-input"
                    />
                </div>
                <button
                    type="submit"
                    disabled={state.submitting}
                    className={`ai-submit-button ${hoverEffect ? 'hover-effect' : ''}`}
                    onMouseEnter={() => setHoverEffect(true)}
                    onMouseLeave={() => setHoverEffect(false)}
                >
                    {state.submitting ? 'Sending...' : 'Send Message'}
                    <Send size={18} className="send-icon" />
                </button>
            </form>
        </div>
    );
}

const ContactPage = () => {
    return (
        <div className="ai-artwork-page">
            <AIArtworkContactForm />
        </div>
    );
}

export default ContactPage;