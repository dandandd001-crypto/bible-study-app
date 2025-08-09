import React, { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Input } from '../../components/UI/Input.jsx';
import { Button } from '../../components/UI/Button.jsx';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/login',
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success('Password reset email sent.');
  }

  React.useEffect(() => {
    document.title = 'Reset Password • Bible Study';
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border rounded-lg p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Reset your password</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button className="w-full" disabled={busy}>
            {busy ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </div>
    </div>
  );
}
