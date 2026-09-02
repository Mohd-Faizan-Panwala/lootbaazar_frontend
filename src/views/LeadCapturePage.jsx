import React, { useState } from 'react';
import { MessageCircle, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function LeadCapturePage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const businessNumber = "918766797018"; // Your WhatsApp number

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNum = mobileNumber.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      // Use your backend host IP or environment variable
      const backendUrl = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
      const apiKey = process.env.REACT_APP_API_KEY || 'lootbazaar_secret_key';

      const response = await fetch(`${backendUrl}/api/frontend/leads/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          mobileno: cleanNum,
          source: 'mobile_qr_scan'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Could not connect to the server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#F3F4F6',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '28px 24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        {/* Header Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <MessageCircle size={30} color="#FFFFFF" />
        </div>

        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#111827' }}>
          Connect with LootBaazar
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6B7280' }}>
          Enter your mobile number to connect and receive special offers & updates.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: '13px',
                textAlign: 'left'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {loading ? <Loader2 size={18} className="spin-loader" /> : <Send size={18} />}
              <span>{loading ? 'Submitting...' : 'Connect Now'}</span>
            </button>
          </form>
        ) : (
          <div>
            <div style={{ color: '#059669', marginBottom: '16px' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 10px auto' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Number Saved!</h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#4B5563' }}>
                Thank you. We have saved your number in our system.
              </p>
            </div>

            <a
              href={`https://wa.me/${businessNumber}?text=${encodeURIComponent("Hi LootBaazar, I just registered my number!")}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                padding: '12px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <MessageCircle size={18} />
              <span>Chat on WhatsApp Directly</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}