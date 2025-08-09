import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { Input } from '../../components/UI/Input.jsx';
import { Button } from '../../components/UI/Button.jsx';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) toast.error(error.message);
    else toast.success('Check your email to confirm registration.');
  }

  React.useEffect(() => {
    document.title = 'Signup • Bible Study';
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border rounded-lg p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Create an account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm mb-1 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button className="w-full">Sign Up</Button>
        </form>
        <div className="mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/auth/login" className="underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
