import React, { useState } from 'react';
import { User, Network, Building2, Users, Monitor, Stethoscope, MapPin, Calendar, Loader2, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, kehadiran: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.kehadiran) {
      setErrorMsg('Please complete all required fields (Name and Attendance).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Validate duplicate name
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const json = await res.json();
      if (json.status === 'success') {
        const existingAttendees = json.data || [];
        const isDuplicate = existingAttendees.some((attendee: any) => 
          attendee['Nama Lengkap'] && 
          attendee['Nama Lengkap'].toString().toLowerCase().trim() === formData.nama.toLowerCase().trim()
        );

        if (isDuplicate) {
          setErrorMsg('Nama Anda sudah terdaftar. (Name is already registered)');
          setIsSubmitting(false);
          return;
        }
      }

      setSubmittedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');

      const data = new FormData();
      data.append('nama', formData.nama);
      data.append('departemen', formData.departemen);
      data.append('company', formData.company);
      data.append('kehadiran', formData.kehadiran);

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: data,
        mode: 'no-cors'
      }).catch(error => console.error('Error submitting form:', error));

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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 sm:p-6 font-sans">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white rounded-2xl overflow-hidden relative">
          <div className="h-2 w-full bg-emerald-500 absolute top-0 left-0"></div>
          <CardHeader className="text-center pt-12 pb-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShieldCheck className="w-10 h-10 text-emerald-600" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">Attendance Confirmed</CardTitle>
            <CardDescription className="text-base text-neutral-500 mt-2">
              Thank you, <strong className="text-neutral-900 font-semibold">{formData.nama}</strong>. Your check-in is complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="bg-neutral-50 rounded-xl p-6 text-center border border-neutral-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                 <Clock className="w-4 h-4 text-neutral-400" />
                 <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Check-in Time</p>
              </div>
              <p className="text-3xl font-extrabold text-neutral-900 tracking-tight">{submittedAt}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-neutral-100 bg-white shadow-sm rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Method</p>
                <p className="text-sm font-semibold text-neutral-900">{formData.kehadiran}</p>
              </div>
              {formData.departemen ? (
                <div className="border border-neutral-100 bg-white shadow-sm rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Department</p>
                  <p className="text-sm font-semibold text-neutral-900 truncate px-2">{formData.departemen}</p>
                </div>
              ) : (
                <div className="border border-neutral-100 bg-white shadow-sm rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Company</p>
                  <p className="text-sm font-semibold text-neutral-900 truncate px-2">{formData.company || '-'}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                 <Stethoscope className="w-4 h-4" />
                 Event: MINI MCU
              </h4>
              <div className="text-sm text-blue-800/80 font-medium space-y-1.5 mt-2">
                <p><strong>Location:</strong> Meeting Room 2, 27th Floor</p>
                <p><strong>Time:</strong> After the Health Talk session ends.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-8 pb-8 pt-0">
            <Button className="w-full h-12 text-base font-semibold bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors" onClick={resetForm}>
              Done
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-lg mb-10 text-center">
        <img src="/logo-51x61.png" alt="The Gesit Companies" className="h-12 mx-auto mb-6 drop-shadow-sm" />
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">Health Talk Attendance</h1>
        <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">The Gesit Companies &middot; Kamis, 02 Juli 2026</p>
      </div>

      <div className="w-full max-w-lg space-y-6">
        {/* Event Details Card */}
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-neutral-100">
            <div className="p-5 sm:p-6 flex items-start gap-5 hover:bg-neutral-50/50 transition-colors">
              <div className="p-2.5 bg-neutral-50 rounded-xl shrink-0">
                 <Stethoscope className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Featured Speaker</p>
                <p className="text-base font-bold text-neutral-900">dr. Cindy Astrella, B.Med.Sci., SpPD</p>
                <p className="text-sm font-medium text-neutral-500 mt-1">Diabetes & Other Metabolic Diseases</p>
              </div>
            </div>
            <div className="p-5 sm:p-6 flex items-start gap-5 hover:bg-neutral-50/50 transition-colors">
              <div className="p-2.5 bg-neutral-50 rounded-xl shrink-0">
                 <Calendar className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Date & Time</p>
                <p className="text-base font-bold text-neutral-900">Kamis, 02 Juli 2026</p>
                <p className="text-sm font-medium text-neutral-500 mt-1">10:00 &ndash; 11:00 WIB</p>
              </div>
            </div>
            <div className="p-5 sm:p-6 flex items-start gap-5 hover:bg-neutral-50/50 transition-colors">
              <div className="p-2.5 bg-neutral-50 rounded-xl shrink-0">
                 <MapPin className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Location</p>
                <p className="text-base font-bold text-neutral-900">Conference Room</p>
                <p className="text-sm font-medium text-neutral-500 mt-1">Head Office</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        {isPastEvent ? (
          <Card className="shadow-lg border-0 bg-white rounded-2xl text-center overflow-hidden">
            <CardContent className="py-16 px-8">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Clock className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Event Concluded</h3>
              <p className="text-sm font-medium text-neutral-500">The registration period for this event has ended.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-neutral-900 px-6 sm:px-8 py-6">
              <CardTitle className="text-xl font-bold text-white">Attendance Form</CardTitle>
              <CardDescription className="text-neutral-300 font-medium text-sm mt-1">
                 Please fill out your details to confirm presence
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2.5">
                  <Label htmlFor="nama" className="text-sm font-bold text-neutral-800">Full Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input 
                      id="nama"
                      name="nama"
                      placeholder="Enter your full name" 
                      className="pl-11 h-12 text-base bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl transition-all"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="departemen" className="text-sm font-bold text-neutral-800">Department <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span></Label>
                  <div className="relative">
                    <Network className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input 
                      id="departemen"
                      name="departemen"
                      placeholder="e.g. HR / Finance" 
                      className="pl-11 h-12 text-base bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl transition-all"
                      value={formData.departemen}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="company" className="text-sm font-bold text-neutral-800">Company <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span></Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input 
                      id="company"
                      name="company"
                      placeholder="e.g. Gesit / Rheem" 
                      className="pl-11 h-12 text-base bg-neutral-50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl transition-all"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Attendance Method <span className="text-red-500">*</span></Label>
                  <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full border border-slate-100">
                    <label
                      htmlFor="offline"
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.kehadiran === 'Offline'
                          ? 'bg-white text-neutral-800 shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-600 font-medium'
                      }`}
                    >
                      <input
                        type="radio"
                        id="offline"
                        name="kehadiran"
                        value="Offline"
                        className="sr-only"
                        checked={formData.kehadiran === 'Offline'}
                        onChange={() => handleRadioChange('Offline')}
                      />
                      <Users className="h-5 w-5" />
                      <span className="text-sm">Offline</span>
                    </label>

                    <label
                      htmlFor="online"
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.kehadiran === 'Online'
                          ? 'bg-white text-neutral-800 shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-600 font-medium'
                      }`}
                    >
                      <input
                        type="radio"
                        id="online"
                        name="kehadiran"
                        value="Online"
                        className="sr-only"
                        checked={formData.kehadiran === 'Online'}
                        onChange={() => handleRadioChange('Online')}
                      />
                      <Monitor className="h-5 w-5" />
                      <span className="text-sm">Online</span>
                    </label>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                    <p className="text-sm text-red-700 font-bold">{errorMsg}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-14 mt-4 text-base font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !formData.nama || !formData.kehadiran}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Processing Check-in...
                    </>
                  ) : (
                    'Confirm Attendance'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-14 mb-8 text-center text-xs font-semibold text-neutral-400 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} IT Operation Gesit
      </div>
    </div>
  );
}
