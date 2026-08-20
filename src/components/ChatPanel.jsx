import { useState, useEffect, useRef } from 'react';
import { Send, Users, X } from 'lucide-react';
import { createSmartSocket, PartyChannelFallback } from '../utils/backend';

let socket = null;
let fallbackChannel = null;

export default function ChatPanel({ room, onClose }) {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('wp_username') || localStorage.getItem('anicine_username');
        if (storedUser) {
            setUsername(storedUser);
            setJoined(true);
        }

        fallbackChannel = new PartyChannelFallback(room, storedUser || 'Guest');
        fallbackChannel.on('receive_message', (data) => {
            setMessages((list) => {
                if (list.some(m => m.message === data.message && m.author === data.author && m.time === data.time)) {
                    return list;
                }
                return [...list, data];
            });
        });

        try {
            socket = createSmartSocket();
            if (socket) {
                socket.on('receive_message', (data) => {
                    setMessages((list) => {
                        if (list.some(m => m.message === data.message && m.author === data.author && m.time === data.time)) {
                            return list;
                        }
                        return [...list, data];
                    });
                });
            }
        } catch (e) {}

        return () => {
            if (socket) socket.disconnect();
            if (fallbackChannel) fallbackChannel.close();
        };
    }, [room]);

    const joinRoom = (e) => {
        e.preventDefault();
        if (username.trim()) {
            if (socket && socket.connected) {
                socket.emit('join_room', { room, username });
            }
            setJoined(true);
            setMessages([{
                author: 'System',
                message: 'You have joined the Watch Party!',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (currentMessage.trim()) {
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            if (socket && socket.connected) {
                socket.emit('send_message', messageData);
            }
            if (fallbackChannel) {
                fallbackChannel.emit('receive_message', messageData);
            }
            setMessages((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="w-full bg-[#0d0d0d] flex flex-col h-full font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#121212]">
                <h3 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-[0.2em] font-['Syne',sans-serif]">
                    <Users size={16} className="text-[#1db954]" />
                    Chat <span className="text-[10px] bg-white/5 px-2.5 py-0.5 rounded-full text-white/50 tracking-normal font-mono">{room}</span>
                </h3>
                <button onClick={onClose} className="text-white/40 hover:text-white transition p-1"><X size={18} /></button>
            </div>

            {!joined ? (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#1db954]/10 border border-[#1db954]/20 rounded-2xl flex items-center justify-center mb-5 text-[#1db954]">
                        <Users size={28} />
                    </div>
                    <h4 className="text-white font-black text-base mb-1 uppercase tracking-tight font-['Syne',sans-serif]">Join Chat</h4>
                    <p className="text-[11px] text-white/40 mb-6">Enter your name to participate in the conversation.</p>
                    <form onSubmit={joinRoom} className="w-full flex flex-col gap-3 max-w-xs">
                        <input
                            type="text"
                            placeholder="Your name..."
                            disabled={joined}
                            className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl p-3.5 outline-none focus:border-[#1db954]/50 text-center transition"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <button type="submit" className="bg-[#1db954] hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-lg shadow-[#1db954]/20 active:scale-95">Join Chat</button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] custom-scrollbar pb-10">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.author === username ? 'items-end' : 'items-start'}`}>
                                <span className="text-[9px] text-white/40 mb-1 font-bold">{msg.author} • {msg.time}</span>
                                <div className={`px-3.5 py-2 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed ${msg.author === 'System' ? 'bg-[#1db954]/10 text-[#1db954] w-full text-center text-[10px] font-bold border border-[#1db954]/20' : msg.author === username ? 'bg-[#1db954] text-black font-semibold shadow-md' : 'bg-white/5 text-white border border-white/5'}`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-3 border-t border-white/5 bg-[#121212] flex gap-2">
                        <input
                            type="text"
                            value={currentMessage}
                            placeholder="Type a message..."
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 text-white text-xs rounded-xl px-4 outline-none focus:border-[#1db954]/50 transition"
                        />
                        <button type="submit" className="w-10 h-10 rounded-xl bg-[#1db954] flex items-center justify-center text-black hover:bg-emerald-400 transition flex-shrink-0 shadow-lg shadow-[#1db954]/20 active:scale-95">
                            <Send size={15} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
