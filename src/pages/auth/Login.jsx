import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { Input } from '../../components/UI/Input.jsx';
import { Button } from '../../components/UI/Button.jsx';
import toast from 'react-hot-toast';
import { Library } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/';

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate(from, { replace: true });
    }
  }

  React.useEffect(() => {
    document.title = 'Login • Bible Study';
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border rounded-lg p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <Library className="text-indigo-600" />
          <div className="text-lg font-semibold">Bible Study</div>
        </div>
        <h1 className="text-xl font-semibold mb-4">Welcome back</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm mb-1 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button className="w-full" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="flex items-center justify-between mt-4 text-sm">
          <Link to="/auth/signup" className="underline">
            Create account
          </Link>
          <Link to="/auth/reset" className="underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
