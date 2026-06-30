import React, { useState } from 'react';
import { User, Network, Building2, Users, Monitor, Fingerprint, Stethoscope, AlertCircle, CheckCircle2, RefreshCw, Megaphone, MapPin, Clock, X } from 'lucide-react';

// TODO: Ganti URL ini dengan URL Web App dari Google Apps Script Anda setelah di-deploy
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyhPNwvim4QnkY-kFHWjR9b-WhYd-vcZxwgq2k1NbVYt22dl17GkNx6jKZv986SKB2MXA/exec';

const EVENT_END_TIME = new Date('2026-07-02T11:00:00+07:00').getTime();

export default function Home() {
  const isPastEvent = Date.now() > EVENT_END_TIME;
  const [formData, setFormData] = useState({
    nama: '',
    departemen: '',
    company: '',
    kehadiran: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.kehadiran) {
      setErrorMsg('Please complete all required fields (Name and Attendance).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSubmittedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');

    try {
      const data = new FormData();
      data.append('nama', formData.nama);
      data.append('departemen', formData.departemen);
      data.append('company', formData.company);
      data.append('kehadiran', formData.kehadiran);

      // Karena mode 'no-cors', kita tidak mendapat status respons. 
      // Server Google Script memakan waktu cukup lama (2-5 detik), jadi kita jalankan fetch di background.
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: data,
        mode: 'no-cors'
      }).catch(error => console.error('Error submitting form:', error));

      // Simulasi waktu loading selama 1 detik agar transisi UI terasa natural
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMsg('An error occurred while submitting data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ nama: '', departemen: '', company: '', kehadiran: '' });
    setIsSuccess(false);
    setErrorMsg('');
  };

  if (isSuccess) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <div className="success-card">
          {/* Icon */}
          <div className="success-icon-ring">
            <CheckCircle2 size={40} strokeWidth={2.5} color="var(--primary)" />
          </div>

          {/* Title */}
          <h2 className="success-title">Attendance Recorded!</h2>
          <p className="success-subtitle">
            Thank you, <strong>{formData.nama}</strong>.<br />
            Your attendance has been confirmed.
          </p>

          {/* Time Badge */}
          {submittedAt && (
            <div className="success-time-block">
              <span className="success-time-label">Check-in Time</span>
              <span className="success-time-value">{submittedAt}</span>
            </div>
          )}

          {/* Meta Info */}
          <div className="success-info-row">
            <div className="success-info-item">
              <span className="success-info-label">Method</span>
              <span className="success-info-value">{formData.kehadiran}</span>
            </div>
            {formData.departemen && (
              <div className="success-info-item">
                <span className="success-info-label">Department</span>
                <span className="success-info-value">{formData.departemen}</span>
              </div>
            )}
          </div>

          {/* Announcement Card */}
          <div style={{ 
            width: '100%',
            padding: '20px', 
            borderRadius: '16px', 
            backgroundColor: '#f0fdf4', 
            border: '1.5px solid #bbf7d0', 
            textAlign: 'left' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
              <Megaphone size={18} strokeWidth={2.5} />
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pengumuman: MINI MCU</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                <span>Ruang Meeting 2, Lt. 27</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                <span>Setelah sesi Health Talk selesai</span>
              </div>
            </div>
          </div>

          <button type="button" className="btn-ghost" onClick={resetForm} style={{ marginTop: '24px' }}>
            <X size={18} strokeWidth={2.5} />
            Close
          </button>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '32px', paddingBottom: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>
          Copyright &copy; {new Date().getFullYear()} by IT Operation Gesit
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">

      {/* Header Area */}
      <div className="header">
        <img src="/logo-51x61.png" alt="The Gesit Companies" className="company-logo" />
        <h1>Health Talk</h1>
      </div>

      {/* Speaker Card */}
      <div className="speaker-card">
        <div className="speaker-icon">
          <Stethoscope size={28} strokeWidth={2.5} />
        </div>
        <div className="speaker-info">
          <span className="speaker-label">Speaker</span>
          <span className="speaker-name">dr. Cindy Astrella, B.Med.Sci., SpPD</span>
          <span className="speaker-topic">Topic: Diabetes & Other Metabolic Diseases</span>
        </div>
      </div>

      {isPastEvent ? (
        <div className="form-card" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Registration Closed</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            We're sorry, attendance registration for this event has been closed as the event has ended.
          </p>
        </div>
      ) : (
        <div className="form-card">
          <div className="form-header">
            <h1>Attendance Form</h1>
            <p>Please fill in your details to be validated by the committee.</p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label" htmlFor="nama">FULL NAME *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
                <User size={18} className="input-icon" strokeWidth={2.5} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="departemen">DEPARTMENT <span className="optional">(optional)</span></label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="departemen"
                  name="departemen"
                  className="form-control"
                  placeholder="e.g. HR / Finance / IT"
                  value={formData.departemen}
                  onChange={handleChange}
                />
                <Network size={18} className="input-icon" strokeWidth={2.5} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="company">COMPANY / INSTITUTION <span className="optional">(optional)</span></label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-control"
                  placeholder="e.g. Gesit / Rheem / Alakasa"
                  value={formData.company}
                  onChange={handleChange}
                />
                <Building2 size={18} className="input-icon" strokeWidth={2.5} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ATTENDANCE METHOD *</label>
              <div className="segmented-control">
                <label className="segmented-label">
                  <input
                    type="radio"
                    name="kehadiran"
                    value="Offline"
                    checked={formData.kehadiran === 'Offline'}
                    onChange={handleChange}
                    required
                  />
                  <div className="segmented-button">
                    <Users size={18} strokeWidth={2.5} /> Offline
                  </div>
                </label>

                <label className="segmented-label">
                  <input
                    type="radio"
                    name="kehadiran"
                    value="Online"
                    checked={formData.kehadiran === 'Online'}
                    onChange={handleChange}
                    required
                  />
                  <div className="segmented-button">
                    <Monitor size={18} strokeWidth={2.5} /> Online
                  </div>
                </label>
              </div>
            </div>

            {errorMsg && (
              <div className="status-message status-error">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !formData.nama || !formData.kehadiran}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  VERIFYING...
                </>
              ) : (
                <>
                  <Fingerprint size={20} strokeWidth={2.5} />
                  VERIFY ATTENDANCE
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '32px', paddingBottom: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>
        Copyright &copy; {new Date().getFullYear()} by IT Operation Gesit
      </div>
    </div>
  );
}
