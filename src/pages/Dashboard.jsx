import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { encryptNote } from "../utils/encrypt";
import { decryptNote } from "../utils/decrypt";
import useAuth from "../hooks/useAuth";
import api from "../api/axios-Instance";

// Safe decrypt — never crash the render
const safeDecrypt = (text) => {
    if (!text) return "";
    try {
        return decryptNote(text) || "";
    } catch {
        return "[Unable to decrypt]";
    }
};

// Debounce hook — delays value update until user stops typing
const useDebounce = (value, delay = 400) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [title, setTitle] = useState("");
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Only hit the API after user stops typing for 400ms
    const debouncedSearch = useDebounce(search, 400);

    const fetchNotes = useCallback(async (query = "") => {
        try {
            setLoading(true);
            const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
            const response = await api.get(`/notes${params}`);
            setNotes(response.data.data ?? []);
        } catch (err) {
            console.error("Failed to fetch notes:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fire API only when debounced value changes — not on every keystroke
    useEffect(() => {
        fetchNotes(debouncedSearch);
    }, [debouncedSearch, fetchNotes]);

    // Client-side filter for instant feedback while debounce is pending
    const filteredNotes = useMemo(() => {
        if (!search.trim()) return notes;
        const q = search.toLowerCase();
        return notes.filter(
            (n) =>
                n.title?.toLowerCase().includes(q) ||
                safeDecrypt(n.note).toLowerCase().includes(q)
        );
    }, [notes, search]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        setError("");
        try {
            setAdding(true);
            await api.post("/notes", {
                title: title.trim(),
                note: encryptNote(note),
            });
            setTitle("");
            setNote("");
            setShowForm(false);
            fetchNotes(debouncedSearch);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to add note");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            await api.delete(`/notes/${id}`);
            // Optimistic UI — remove from local state instantly, no refetch needed
            setNotes((prev) => prev.filter((n) => n._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeletingId(null);
            setDeleteConfirmId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        navigate("/");
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setError("");
        setTitle("");
        setNote("");
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">

            {/* Background — matches auth page */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-100 rounded-full opacity-50" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-100 rounded-full opacity-50" />
            </div>

            <div className="relative z-10">

                {/* NAVBAR */}
                <header className="bg-white/80 backdrop-blur border-b border-slate-200/80 sticky top-0 z-20">
                    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <span className="text-base font-bold text-slate-800 tracking-tight">Secure Notes</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-indigo-600">{getInitials(user?.name)}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                            </div>
                            <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-8">

                    {/* Page title row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Notes</h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
                                {search.trim() ? " matched" : " stored securely"}
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowForm(!showForm); setError(""); }}
                            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg self-start sm:self-auto active:scale-[0.98] ${showForm
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-100"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                {showForm
                                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                }
                            </svg>
                            {showForm ? "Cancel" : "Add Note"}
                        </button>
                    </div>

                    {/* ADD NOTE FORM */}
                    {showForm && (
                        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/60 p-6 mb-8">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                New Note
                            </h2>

                            {error && (
                                <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleAddNote} className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Note title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Note</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Write your secure note..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200"
                                    >
                                        {adding ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Save Note
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelForm}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SEARCH + FILTER BAR */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Live search indicator */}
                        {loading && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm shrink-0">
                                <svg className="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Searching...
                            </div>
                        )}
                    </div>

                    {/* NOTES GRID */}
                    {!loading && filteredNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-semibold text-slate-600">
                                    {search.trim() ? "No notes matched" : "No notes yet"}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    {search.trim()
                                        ? "Try a different search term"
                                        : `Click "Add Note" to create your first note`}
                                </p>
                                {search.trim() && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="mt-3 text-sm text-indigo-500 hover:text-indigo-600 font-medium"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredNotes.map((item) => (
                                <div
                                    key={item._id}
                                    className="group bg-white border border-slate-200/80 rounded-3xl shadow-sm shadow-slate-100 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                </svg>
                                            </div>

                                            {/* Delete: confirm-first pattern */}
                                            {deleteConfirmId === item._id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-500 font-medium">Delete?</span>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        disabled={deletingId === item._id}
                                                        className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId === item._id ? (
                                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                            </svg>
                                                        ) : "Yes"}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirmId(item._id)}
                                                    className=" p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                                    title="Delete note"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed line-clamp-4">
                                            {safeDecrypt(item.note)}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5">
                                        <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                        <span className="text-xs text-slate-400">Encrypted</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;