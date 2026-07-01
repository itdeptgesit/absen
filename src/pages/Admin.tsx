import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Users, Search, Download, Lock, Network, Building2, UserCheck, FileSpreadsheet, RefreshCw, LogOut, Wifi, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hh}:${mm}`;
}

export default function Admin() {
  const [data, setData] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const json = await res.json();
      if (json.status === 'success') {
        setData((json.data || []).map((r: any, i: number) => ({ ...r, id: i + 1 })));
        setLastUpdated(new Date());
      } else {
        setError('Failed to load data.');
      }
    } catch {
      setError('A connection error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

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
    const tableRows = [
      `<tr>${headers.map(h => `<th style="background:#0f172a;color:white;font-weight:bold;padding:8px;">${h}</th>`).join('')}</tr>`,
      ...rows.map(row => `<tr>${row.map(cell => `<td style="padding:8px;">${cell}</td>`).join('')}</tr>`)
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center py-10 px-4 font-sans relative">
        {/* Decorative Background Elements */}
        <div className="fixed top-0 left-0 w-full h-96 bg-neutral-900/5 rounded-b-[100%] scale-150 transform -translate-y-1/2 pointer-events-none"></div>
        
        <div className="mb-8 z-10 text-center">
           <img src="/logo-51x61.png" alt="Logo" className="h-12 mx-auto mb-4 drop-shadow-sm" />
           <h2 className="text-xl font-bold text-neutral-900 tracking-tight">The Gesit Companies</h2>
        </div>

        <Card className="w-full max-w-sm shadow-2xl shadow-neutral-200/50 border border-neutral-100 bg-white rounded-3xl overflow-hidden z-10 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-900"></div>
          <CardHeader className="text-center pt-10 pb-6 px-8">
            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-neutral-100">
               <Lock className="w-6 h-6 text-neutral-700" strokeWidth={2} />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight text-neutral-900">Admin Access</CardTitle>
            <CardDescription className="text-sm mt-1.5 text-neutral-500 font-medium">
              Secure authentication required
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-4 text-base bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900 focus-visible:bg-white rounded-xl transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>
              {authError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs text-red-600 font-bold text-center">{authError}</p>
                </div>
              )}
              <Button type="submit" className="w-full h-12 text-base font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm">
                Unlock Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-12 z-10 text-xs font-semibold text-neutral-400 uppercase tracking-widest">
           &copy; {new Date().getFullYear()} IT Operation Gesit
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo-51x61.png" alt="Logo" className="h-8" />
            <div className="h-6 w-[1px] bg-neutral-200"></div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 tracking-tight">Health Talk</h1>
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Control Panel</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 font-medium" onClick={() => { setIsAuthenticated(false); setData([]); setPassword(''); }}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Attendance Overview</h2>
            <p className="text-sm text-neutral-500 mt-1">Manage and monitor participant check-ins in real-time.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="h-10 bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm rounded-lg font-medium" asChild>
              <a href="https://docs.google.com/spreadsheets/d/1FJ6MZagCaH2L3IsrW0uu-dLvQZ-hyYt8kyGiARYLdW4/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> View Source Data
              </a>
            </Button>
            <Button className="h-10 bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm rounded-lg font-medium" onClick={downloadExcel} disabled={data.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-neutral-200 shadow-sm bg-white overflow-hidden rounded-xl transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Total Attendees</p>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-neutral-900 tracking-tight">{data.length}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 shadow-sm bg-white overflow-hidden rounded-xl transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Offline Presence</p>
                 <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-neutral-900 tracking-tight">{totalOffline}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200 shadow-sm bg-white overflow-hidden rounded-xl transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Online Presence</p>
                 <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <Wifi className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold text-neutral-900 tracking-tight">{totalOnline}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-neutral-200 shadow-sm bg-white rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input 
                type="text" 
                placeholder="Search by name, department, or company..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-full bg-neutral-50 border-neutral-200 focus:border-neutral-300 focus:bg-white transition-all rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <span className="text-xs font-semibold text-neutral-500">
                  {lastUpdated ? `Last synced: ${lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : ''}
               </span>
               <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="h-10 px-4 bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 shadow-sm rounded-lg font-medium">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-neutral-300" />
                <p className="font-semibold text-sm">Syncing data...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-neutral-400">
                <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-neutral-300" />
                </div>
                <p className="font-semibold text-base text-neutral-700">No attendees found</p>
                <p className="text-sm mt-1">Try adjusting your search filters</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-neutral-500 uppercase bg-neutral-50/80 border-b border-neutral-100 font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 w-16">#</th>
                    <th className="px-6 py-4">Attendee Info</th>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4 text-right">Time & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {filtered.map((row, index) => {
                    const isOnline = row.Kehadiran.toLowerCase().includes('online');
                    return (
                      <tr key={row.id} className="hover:bg-neutral-50/50 transition-colors group">
                        <td className="px-6 py-4 text-neutral-400 font-semibold whitespace-nowrap">
                          {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">{row['Nama Lengkap']}</div>
                          <div className="text-neutral-500 font-medium text-xs mt-1.5 flex items-center gap-1.5">
                             <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Registered
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                             {row.Company && (
                              <div className="flex items-center text-xs text-neutral-700 font-semibold">
                                <Building2 className="mr-2 h-4 w-4 text-neutral-400" />
                                {row.Company}
                              </div>
                            )}
                            {row.Departemen && (
                              <div className="flex items-center text-xs text-neutral-500 font-medium">
                                <Network className="mr-2 h-4 w-4 text-neutral-400" />
                                {row.Departemen}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-2.5">
                            <Badge variant="outline" className={`border-0 font-bold px-3 py-1 rounded-full text-[11px] uppercase tracking-wide ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {isOnline ? 'Online' : 'Offline'}
                            </Badge>
                            <span className="text-xs text-neutral-500 font-semibold">{formatTimestamp(row.Timestamp)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          {!loading && data.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs font-semibold text-neutral-500">
               <div>Showing <strong className="text-neutral-900">{filtered.length}</strong> of <strong className="text-neutral-900">{data.length}</strong> total records</div>
            </div>
          )}
        </Card>
      </main>

      <footer className="py-8 text-center text-sm text-neutral-400 font-medium">
        &copy; {new Date().getFullYear()} IT Operation Gesit. All rights reserved.
      </footer>
    </div>
  );
}
