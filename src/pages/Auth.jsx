import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name.trim()) throw new Error('Name is required');
                if (password.length < 6) throw new Error('Password must be at least 6 characters');
                await signup(name, email, password);
            }
            navigate(-1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-10">
            {/* Background glow */}
            <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#1db954]/[0.03] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-md">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/30 hover:text-white mb-6 transition-colors active:scale-95"
                >
                    <ArrowLeft size={16} />
                    <span className="text-xs font-medium">Back</span>
                </button>

                {/* Card */}
                <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-6 md:p-10 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-xl bg-[#1db954]/10 border border-[#1db954]/20 flex items-center justify-center mx-auto mb-5">
                            {isLogin ? <LogIn size={24} className="text-[#1db954]" /> : <UserPlus size={24} className="text-[#1db954]" />}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-1">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {isLogin ? 'Sign in to your AniCine account' : 'Join the AniCine community'}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Name</label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-lg px-4 py-3.5 outline-none focus:border-[#1db954]/50 text-sm transition-colors placeholder-white/20"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-lg px-4 py-3.5 outline-none focus:border-[#1db954]/50 text-sm transition-colors placeholder-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-lg px-4 py-3.5 pr-12 outline-none focus:border-[#1db954]/50 text-sm transition-colors placeholder-white/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-[10px] text-white/20 mt-1.5 ml-1">At least 6 characters</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#1db954] text-black rounded-lg font-black uppercase tracking-wider text-sm hover:bg-[#ffd633] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-8 text-center">
                        <p className="text-white/20 text-sm">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="ml-1.5 text-[#1db954] font-bold hover:text-[#ffd633] transition-colors"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/20 text-[10px] mt-6 uppercase tracking-widest font-['Syne',sans-serif]">
                    Ani<span className="text-[#1db954]">Cine</span> • Secure Access
                </p>
            </div>
        </div>
    );
}
