import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, MessageCircle, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function WhatsAppQRModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Dynamically points to the mobile lead-capture route on scan
  const qrTargetUrl = `${window.location.origin}/lead-capture`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    const cleanNum = mobileNumber.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    setLoading(true);

    try {
      const backendUrl = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
      const apiKey = process.env.REACT_APP_API_KEY || 'lootbazaar_secret_key';

      const response = await fetch(`${backendUrl}/api/frontend/leads/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          mobileno: cleanNum,
          source: 'whatsapp_desktop_modal',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: 'Mobile number registered successfully!' });
        setMobileNumber('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to submit. Please try again.' });
      }
    } catch (err) {
      console.error('Lead capture error:', err);
      setStatus({ type: 'error', message: 'Network error. Please verify the backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setStatus({ type: '', message: '' });
        }}
        className="floating-whatsapp-btn"
        title="Connect on WhatsApp / Scan QR"
        aria-label="Open WhatsApp QR Modal"
      >
        <MessageCircle size={28} color="#FFFFFF" strokeWidth={2.3} />
        <span className="whatsapp-ping-bubble"></span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="whatsapp-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="whatsapp-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="whatsapp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="whatsapp-icon-badge">
                  <MessageCircle size={22} color="#FFFFFF" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #1a202c)' }}>
                    Connect on WhatsApp
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #718096)' }}>
                    Scan QR on mobile or enter your number below
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="whatsapp-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Code Section */}
            <div className="whatsapp-qr-container">
              <div className="qr-wrapper">
                <QRCodeSVG
                  value={qrTargetUrl}
                  size={170}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="qr-instruction">
                Scan with your phone camera to open the lead capture page on your phone
              </p>
            </div>

            {/* Divider */}
            <div className="whatsapp-divider">
              <span>OR ENTER NUMBER DIRECTLY</span>
            </div>

            {/* Direct Number Input Form */}
            <form onSubmit={handleSubmit} className="whatsapp-form">
              <div className="whatsapp-input-group">
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="whatsapp-input"
                  disabled={loading}
                />
                <button type="submit" className="whatsapp-submit-btn" disabled={loading}>
                  {loading ? <Loader2 size={16} className="spin-loader" /> : <Send size={16} />}
                  <span>{loading ? 'Saving...' : 'Submit'}</span>
                </button>
              </div>

              {/* Status Alert Box */}
              {status.message && (
                <div className={`whatsapp-status-box ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{status.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}