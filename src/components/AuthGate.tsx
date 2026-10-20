import React, { useEffect, useState } from 'react';
import { acceptInvite, AuthError, getUser, handleAuthCallback, login, logout, MissingIdentityError, onAuthChange, requestPasswordRecovery, updateUser, type User } from '@netlify/identity';
import { ArrowRight, Leaf, LockKeyhole, LogOut } from 'lucide-react';
import App from '../App';
import { MOCK_FACULTY } from '../data/mockData';
import type { AppUser } from '../types';

export function AuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot' | 'password'>('login');
  const [inviteToken, setInviteToken] = useState<string>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthChange((_event, next) => { if (active) setUser(next); });
    (async () => {
      try {
        const callback = await handleAuthCallback();
        if (!active) return;
        if (callback?.type === 'invite') {
          setInviteToken(callback.token);
          setMode('password');
        } else if (callback?.type === 'recovery') {
          setMode('password');
        }
        setUser(await getUser());
      } catch {
        if (active) setError('This account link could not be verified. Request a new link or contact your HR administrator.');
      } finally { if (active) setReady(true); }
    })();
    return () => { active = false; unsubscribe(); };
  }, []);

  async function signOut() {
    setError('');
    try {
      await logout();
      setUser(null);
      setPassword('');
      setMode('login');
      setNotice('You have been logged out.');
    } catch { setError('Unable to log out. Please try again.'); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'forgot') {
        await requestPasswordRecovery(email);
        setNotice('If an account exists for this email, a password reset link has been sent.');
      } else if (mode === 'password') {
        const next = inviteToken ? await acceptInvite(inviteToken, password) : await updateUser({ password });
        setUser(next); setInviteToken(undefined); setMode('login'); setPassword('');
      } else {
        setUser(await login(email, password)); setPassword('');
      }
    } catch (cause) {
      setError(cause instanceof MissingIdentityError
        ? 'Sign-in is unavailable on this host. Please use the university’s Netlify-hosted portal or contact your administrator.'
        : cause instanceof AuthError && cause.status === 401
          ? 'Unable to sign in. Check your email and password, and confirm your account is active.'
          : 'Unable to complete this request. Please try again or contact your HR administrator.');
    } finally { setBusy(false); }
  }

  const roles = user?.roles ?? [];
  const role: AppUser['role'] = roles.some(r => ['admin', 'Administrator'].includes(r)) ? 'Administrator'
    : roles.some(r => ['hr-manager', 'HR Manager'].includes(r)) ? 'HR Manager' : 'Employee';
  const staff = MOCK_FACULTY.find(f => f.email.toLowerCase() === user?.email?.toLowerCase());
  const linkedStaffId = typeof user?.appMetadata?.staff_id === 'string' ? user.appMetadata.staff_id : staff?.staffId;

  if (ready && user && mode !== 'password' && (role !== 'Employee' || linkedStaffId)) {
    return <>{error && <div role="alert" className="bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      <App key={user.id} currentUser={{ id: user.id, name: user.name || user.email || 'UNRE Staff', email: user.email || '', role, staffId: linkedStaffId, title: role }} onLogout={signOut} /></>;
  }

  return <main className="min-h-dvh bg-[#f4f5ef] text-neutral-900 grid lg:grid-cols-[1.1fr_1fr]">
    <section className="relative overflow-hidden bg-[#103e32] text-white px-6 py-10 sm:p-12 lg:p-16 flex flex-col justify-between gap-12">
      <div className="flex items-center gap-3"><span className="rounded-full border border-white/25 p-3"><Leaf className="h-6 w-6 text-lime-200" /></span><span className="font-bold tracking-[0.15em] text-sm">UNRE / HUMAN RESOURCES</span></div>
      <div className="max-w-xl"><p className="text-lime-200 text-xs font-semibold uppercase tracking-[0.22em] mb-5">Vudal · East New Britain · Papua New Guinea</p><h1 className="text-3xl sm:text-5xl leading-tight font-semibold tracking-tight">University of Natural Resources and Environment</h1><p className="mt-6 text-emerald-100/80 leading-relaxed max-w-md">Your staff portal for payroll, leave, attendance and university HR services.</p></div>
      <p className="text-xs text-emerald-100/60 border-t border-white/15 pt-5">Division of Human Resources, Payroll & Staff Welfare</p>
    </section>
    <section className="flex items-center justify-center px-5 py-12 sm:p-12 min-w-0">
      <div className="w-full max-w-sm">
        {!ready ? <div role="status" className="animate-pulse space-y-4"><div className="h-8 w-48 bg-neutral-200 rounded" /><div className="h-12 bg-neutral-200 rounded" /><p className="text-sm text-neutral-500">Checking your session…</p></div>
        : user && mode !== 'password' ? <><LockKeyhole className="text-emerald-800 mb-5" /><h2 className="text-2xl font-bold">Staff access pending</h2><p className="mt-3 text-sm text-neutral-600">Your account is signed in. Contact your HR administrator to link it to your staff record before using the portal.</p>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<button onClick={signOut} className="mt-6 inline-flex items-center gap-2 border border-neutral-300 rounded-lg px-4 py-3"><LogOut className="w-4 h-4" />Log out</button></>
        : <><LockKeyhole className="h-7 w-7 text-emerald-800 mb-6" /><h2 className="text-3xl font-semibold tracking-tight">{mode === 'password' ? 'Set your password' : mode === 'forgot' ? 'Reset your password' : 'Staff sign in'}</h2><p className="text-sm text-neutral-500 mt-3 mb-8">{mode === 'password' ? 'Choose a password for your university account.' : mode === 'forgot' ? 'Enter your account email to receive a reset link.' : 'Use your university staff account to continue.'}</p>
        <form onSubmit={submit} className="space-y-5">
          {mode !== 'password' && <div><label htmlFor="login-email" className="block text-sm font-semibold mb-2">Email address</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base focus:ring-2 focus:ring-emerald-700" /></div>}
          {mode !== 'forgot' && <div><label htmlFor="login-password" className="block text-sm font-semibold mb-2">{mode === 'password' ? 'New password' : 'Password'}</label><input id="login-password" type="password" autoComplete={mode === 'password' ? 'new-password' : 'current-password'} minLength={mode === 'password' ? 8 : undefined} required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base focus:ring-2 focus:ring-emerald-700" />{mode === 'password' && <p className="text-xs text-neutral-500 mt-2">Use at least 8 characters.</p>}</div>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
          <button disabled={busy} className="w-full flex justify-between items-center rounded-lg bg-[#103e32] px-4 py-3.5 text-white font-semibold hover:bg-emerald-900 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'password' ? 'Save password' : mode === 'forgot' ? 'Send reset link' : 'Sign in'}<ArrowRight className="w-4 h-4" /></button>
          {mode !== 'password' && <button type="button" disabled={busy} onClick={() => { setMode(mode === 'forgot' ? 'login' : 'forgot'); setError(''); setNotice(''); }} className="text-sm font-semibold text-emerald-800 underline underline-offset-4">{mode === 'forgot' ? 'Back to sign in' : 'Forgot your password?'}</button>}
        </form><p className="mt-8 pt-5 border-t border-neutral-200 text-xs leading-relaxed text-neutral-500">Access is for authorised university staff. Contact your HR administrator for an account invitation.</p></>}
      </div>
    </section>
  </main>;
}
