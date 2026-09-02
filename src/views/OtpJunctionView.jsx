import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  QrCode, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Smartphone, 
  ShieldCheck, 
  KeyRound, 
  Radio,
  FileText
} from 'lucide-react';

export default function OtpJunctionView() {
  const [accounts, setAccounts] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [targetNumber, setTargetNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  // Use a ref to prevent interval closure from forcefully resetting user's selection
  const selectedSessionIdRef = useRef(selectedSessionId);
  useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId;
  }, [selectedSessionId]);

  const backendUrl = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:3000`;
  const apiKey = process.env.REACT_APP_API_KEY || 'lootbazaar_secret_key';

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/frontend/whatsapp-junction/accounts`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);

        // Keep current selected account if it exists, otherwise default to first available
        setSelectedSessionId((currentSelected) => {
          if (currentSelected && data.accounts.some(a => a.sessionId === currentSelected)) {
            return currentSelected;
          }
          return data.accounts[0]?.sessionId || '';
        });
      }
    } catch (err) {
      console.error('Accounts sync error:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(fetchAccounts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    try {
      const res = await fetch(`${backendUrl}/api/frontend/whatsapp-junction/accounts/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ sessionName: newAccountName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        const createdId = data.sessionId;
        setNewAccountName('');
        setIsAddingAccount(false);
        setSelectedSessionId(createdId);
        fetchAccounts();
      }
    } catch (err) {
      console.error('Create account error:', err);
    }
  };

  const handleDelink = async (sessionId, sessionName) => {
    if (!window.confirm(`Are you sure you want to delink "${sessionName}"? This will log out the WhatsApp session.`)) {
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/frontend/whatsapp-junction/accounts/${sessionId}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey }
      });
      const data = await res.json();
      if (data.success) {
        if (selectedSessionIdRef.current === sessionId) {
          setSelectedSessionId('');
        }
        fetchAccounts();
      }
    } catch (err) {
      console.error('Delink error:', err);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setDispatchStatus(null);

    if (!selectedSessionId) {
      setDispatchStatus({ type: 'error', message: 'Please select a WhatsApp sender account.' });
      return;
    }

    const cleanNumber = targetNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setDispatchStatus({ type: 'error', message: 'Enter a valid 10-digit mobile number.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/frontend/whatsapp-junction/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          mobileno: cleanNumber
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchStatus({ 
          type: 'success', 
          message: `Unique OTP (${data.data.otp}) dispatched to +${data.data.toPhone}!` 
        });
        setRecentLogs(prev => [
          {
            phone: data.data.toPhone,
            otp: data.data.otp,
            from: data.data.fromPhone,
            time: new Date().toLocaleTimeString(),
            status: 'Delivered'
          },
          ...prev.slice(0, 6)
        ]);
        setTargetNumber('');
      } else {
        setDispatchStatus({ type: 'error', message: data.message || 'Failed to dispatch OTP.' });
      }
    } catch (err) {
      setDispatchStatus({ type: 'error', message: 'Error communicating with WhatsApp Dispatcher.' });
    } finally {
      setLoading(false);
    }
  };

  const activeAccount = accounts.find(a => a.sessionId === selectedSessionId) || accounts[0];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header */}
      <div style={{
        background: 'var(--card-bg, #FFFFFF)',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid var(--border-color, #E2E8F0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={24} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Multi-Device WhatsApp OTP Junction
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Link multiple WhatsApp devices and send dynamic verification codes through any connected phone.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsAddingAccount(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: '#FF5500',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>Add WhatsApp Account</span>
        </button>
      </div>

      {/* Add New Slot Dialog */}
      {isAddingAccount && (
        <div style={{
          background: 'var(--card-bg, #FFFFFF)',
          borderRadius: '16px',
          padding: '20px',
          border: '2px dashed #FF5500',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Create New WhatsApp Device Gateway</h4>
          <form onSubmit={handleCreateAccount} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="e.g. Sales Phone, Admin 2, Support Number" 
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #E2E8F0)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#25D366',
                color: '#FFFFFF',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Generate Pairing QR
            </button>
            <button
              type="button"
              onClick={() => setIsAddingAccount(false)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #E2E8F0)',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Account List & Pairing Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Accounts List */}
          <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-color, #E2E8F0)'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="#FF5500" />
              <span>Registered Accounts ({accounts.length})</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {accounts.map((acc) => {
                const isSelected = (selectedSessionId || accounts[0]?.sessionId) === acc.sessionId;
                return (
                  <div 
                    key={acc.sessionId}
                    onClick={() => setSelectedSessionId(acc.sessionId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: `2px solid ${isSelected ? '#25D366' : 'var(--border-color, #E2E8F0)'}`,
                      background: isSelected ? 'rgba(37, 211, 102, 0.06)' : 'var(--card-bg, #FFFFFF)',
                      cursor: 'pointer',
                      transition: 'border 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: acc.isReady ? '#059669' : '#F59E0B'
                      }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{acc.sessionName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {acc.isReady ? `+${acc.phone}` : 'Scan QR to Link'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        background: acc.isReady ? '#DEF7EC' : '#FEF3C7',
                        color: acc.isReady ? '#03543F' : '#92400E'
                      }}>
                        {acc.isReady ? 'ONLINE' : 'PAIRING'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelink(acc.sessionId, acc.sessionName);
                        }}
                        title="Delink / Remove Account"
                        style={{
                          padding: '6px',
                          border: 'none',
                          background: '#FEE2E2',
                          color: '#991B1B',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device Pairing Card */}
          {activeAccount && (
            <div style={{
              background: 'var(--card-bg, #FFFFFF)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-color, #E2E8F0)',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700 }}>
                Selected: {activeAccount.sessionName}
              </h4>

              {!activeAccount.isReady ? (
                <div>
                  {activeAccount.qrCode ? (
                    <div style={{ display: 'inline-block', padding: '12px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <img src={activeAccount.qrCode} alt="WhatsApp QR" style={{ width: '210px', height: '210px', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ padding: '36px 0', color: 'var(--text-secondary)' }}>
                      <RefreshCw size={28} className="spin-loader" style={{ margin: '0 auto 10px auto' }} />
                      <p style={{ margin: 0, fontSize: '13px' }}>Generating isolated pairing QR code...</p>
                    </div>
                  )}
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.4' }}>
                    Open WhatsApp &gt; Linked Devices &gt; Scan this QR to pair <b>{activeAccount.sessionName}</b>
                  </p>
                </div>
              ) : (
                <div style={{ padding: '24px 0' }}>
                  <ShieldCheck size={50} color="#059669" style={{ margin: '0 auto 10px auto' }} />
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#059669' }}>Device Linked &amp; Ready</h4>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Sending OTPs as: <b>+{activeAccount.phone}</b>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: OTP Dispatch Console */}
        <div style={{
          background: 'var(--card-bg, #FFFFFF)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border-color, #E2E8F0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} color="#FF5500" />
            <span>Fire Instant Dynamic OTP</span>
          </h3>

          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Active Dispatch Gateway */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                DISPATCH VIA GATEWAY
              </label>
              <div style={{
                padding: '11px 14px',
                borderRadius: '8px',
                background: 'var(--input-bg, #F8FAFC)',
                border: '1px solid var(--border-color, #E2E8F0)',
                fontSize: '14px',
                fontWeight: 600,
                color: activeAccount?.isReady ? '#059669' : '#DC2626'
              }}>
                {activeAccount 
                  ? `${activeAccount.sessionName} (${activeAccount.isReady ? `+${activeAccount.phone}` : 'Offline / Unpaired'})` 
                  : 'No account selected'}
              </div>
            </div>

            {/* Recipient Number */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                RECIPIENT CUSTOMER MOBILE
              </label>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Smartphone size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  disabled={!activeAccount?.isReady || loading}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'var(--input-bg, #F8FAFC)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Static Message Template Preview */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                <FileText size={14} />
                <span>STATIC OTP TEMPLATE (DYNAMIC UNIQUE OTP)</span>
              </label>
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                fontSize: '12px',
                color: '#4B5563',
                lineHeight: '1.6',
                fontFamily: 'monospace'
              }}>
                <b>*LootBaazar Security Verification*</b><br />
                Your one-time verification code is: <b>[DYNAMIC 6-DIGIT OTP]</b><br />
                <i>This code is valid for 5 minutes. Do not share this OTP with anyone.</i><br />
                Thank you for choosing *LootBaazar*!
              </div>
            </div>

            {dispatchStatus && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                background: dispatchStatus.type === 'success' ? '#DEF7EC' : '#FEE2E2',
                color: dispatchStatus.type === 'success' ? '#03543F' : '#991B1B'
              }}>
                {dispatchStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{dispatchStatus.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!activeAccount?.isReady || loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeAccount?.isReady ? '#25D366' : '#9CA3AF',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: activeAccount?.isReady && !loading ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s ease'
              }}
            >
              <Send size={16} />
              <span>{loading ? 'Generating & Dispatching...' : 'Send Dynamic OTP'}</span>
            </button>
          </form>

          {/* Real-time Dispatch Logs */}
          {recentLogs.length > 0 && (
            <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color, #E2E8F0)', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>RECENT DISPATCH LOGS</span>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentLogs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', background: 'var(--bg-hover, #F8FAFC)', borderRadius: '6px' }}>
                    <span>To: <b>+{log.phone}</b> | OTP: <span style={{ color: '#FF5500', fontWeight: 700 }}>{log.otp}</span></span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}