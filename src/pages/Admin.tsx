import React, { useEffect, useState, useMemo } from 'react';
import { Users, Search, Download, Lock, Clipboard, Network, Building2, UserCheck } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyhPNwvim4QnkY-kFHWjR9b-WhYd-vcZxwgq2k1NbVYt22dl17GkNx6jKZv986SKB2MXA/exec';
const ADMIN_PASSWORD = 'Gesit@123';

interface Attendee {
  id: number;
  Timestamp: string;
  'Nama Lengkap': string;
  Departemen: string;
  Company: string;
  Kehadiran: string;
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hh}:${mm} WIB`;
}

export default function Admin() {
  const [data, setData] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const json = await res.json();
      if (json.status === 'success') {
        setData((json.data || []).map((r: any, i: number) => ({ ...r, id: i + 1 })));
      } else {
        setError('Failed to load data.');
      }
    } catch {
      setError('A connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const totalOffline = data.filter(r => !r.Kehadiran.toLowerCase().includes('online')).length;
  const totalOnline = data.filter(r => r.Kehadiran.toLowerCase().includes('online')).length;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return data;
    return data.filter(r =>
      r['Nama Lengkap'].toLowerCase().includes(q) ||
      r.Departemen?.toLowerCase().includes(q) ||
      r.Company?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);



  const downloadExcel = () => {
    if (data.length === 0) return;
    const headers = ['Check-in Time', 'Full Name', 'Department', 'Company', 'Attendance'];
    const rows = data.map(r => [
      formatTimestamp(r.Timestamp),
      r['Nama Lengkap'],
      r.Departemen || '',
      r.Company || '',
      r.Kehadiran,
    ]);
    // Build HTML table (Excel-compatible XLS)
    const tableRows = [
      `<tr>${headers.map(h => `<th style="background:#0d9488;color:white;font-weight:bold;">${h}</th>`).join('')}</tr>`,
      ...rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`)
    ].join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1">${tableRows}</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Attendance_Report_Health_Talk.xls');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    const lines = [
      '=== HEALTH TALK ATTENDANCE RECAP ===',
      `Total: ${data.length} | Offline: ${totalOffline} | Online: ${totalOnline}`,
      '',
      ...data.map((r, i) =>
        `${i + 1}. ${r['Nama Lengkap']} | ${r.Departemen || '-'} | ${r.Company || '-'} | ${r.Kehadiran}`
      ),
    ].join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', minHeight: '100vh' }}>
        <div className="form-card" style={{ textAlign: 'center' }}>
          <Lock size={44} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>Restricted Area</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Enter the password to access the admin dashboard.
          </p>
          <form onSubmit={handleLogin}>
            <div className="input-wrapper" style={{ marginBottom: '12px' }}>
              <input
                type="password"
                className="form-control"
                placeholder="Admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                style={{ paddingLeft: '16px' }}
              />
            </div>
            {authError && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>{authError}</p>}
            <button type="submit" className="submit-btn">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* Stats Row */}
      <div className="admin-stats-row">
        <div className="stat-card">
          <span className="stat-label">TOTAL</span>
          <span className="stat-value">{data.length}</span>
        </div>
        <div className="stat-card stat-card--offline">
          <span className="stat-label">OFFLINE</span>
          <span className="stat-value">{totalOffline}</span>
        </div>
        <div className="stat-card stat-card--online">
          <span className="stat-label">ONLINE</span>
          <span className="stat-value">{totalOnline}</span>
        </div>
      </div>

      {/* Export Actions */}
      <div className="admin-card">
        <div className="export-label">
          <Clipboard size={14} />
          EXPORT GOOGLE SHEETS
        </div>
        <div className="export-btns">
          <button className="btn-outline-primary" onClick={copyToClipboard}>
            <Clipboard size={16} />
            {copySuccess ? 'Copied!' : 'Copy Summary'}
          </button>
          <button className="btn-primary" onClick={downloadExcel}>
            <Download size={16} />
            Download Excel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="admin-search-wrapper">
        <Search size={17} className="admin-search-icon" />
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search name, department, institution..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Attendee List */}
      <div className="attendee-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--primary)' }}></div>
            <p style={{ marginTop: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>Loading data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No data found.</p>
          </div>
        ) : (
          filtered.map(row => {
            const isOnline = row.Kehadiran.toLowerCase().includes('online');
            return (
              <div key={row.id} className="attendee-card">
                <div className="attendee-card-top">
                  <span className="attendee-ts">{formatTimestamp(row.Timestamp)}</span>
                  <span className={isOnline ? 'badge badge--online' : 'badge badge--offline'}>
                    {isOnline ? <UserCheck size={13} /> : <Users size={13} />}
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="attendee-name">{row['Nama Lengkap']}</div>
                {row.Departemen && (
                  <div className="attendee-meta">
                    <Network size={13} />
                    Dept: {row.Departemen}
                  </div>
                )}
                {row.Company && (
                  <div className="attendee-meta">
                    <Building2 size={13} />
                    Comp: {row.Company}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
