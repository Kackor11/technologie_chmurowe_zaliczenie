import React, { useState, useEffect } from 'react';

export default function App() {
    // Stany autoryzacji
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');

    // Stany dla Spotkań (Meetings)
    const [meetings, setMeetings] = useState([]);
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingDesc, setMeetingDesc] = useState('');

    // Stany dla Zadań (Tasks) - Dostosowane do Task.java
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Auth failed');
                return;
            }
            if (!isRegister) {
                setUser(data);
            } else {
                setIsRegister(false);
                alert('Registered successfully! Please log in.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // POBIERANIE DANYCH
    const fetchMeetings = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/meetings/user/${user.id}`);
            const data = await res.json();
            setMeetings(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (user) {
            fetchMeetings();
            fetchTasks();
        }
    }, [user]);

    // LOGIKA SPOTKAŃ (MEETINGS)
    const addMeeting = async (e) => {
        e.preventDefault();
        await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: meetingTitle, description: meetingDesc, userId: user.id })
        });
        setMeetingTitle(''); setMeetingDesc(''); await fetchMeetings();
    };

    const deleteMeeting = async (id) => {
        await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
        await fetchMeetings();
    };

    // LOGIKA ZADAŃ (TASKS) - Tylko Title (Zgodnie z model/Task.java)
    const addTask = async (e) => {
        e.preventDefault();
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: taskTitle, completed: false })
        });
        setTaskTitle(''); await fetchTasks();
    };

    const deleteTask = async (id) => {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        await fetchTasks();
    };

    // EKRAN LOGOWANIA
    if (!user) {
        return (
            <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2>{isRegister ? 'Register' : 'Login'}</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '8px' }} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '8px' }} />
                    <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {isRegister ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>
                <button onClick={() => setIsRegister(!isRegister)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
                    {isRegister ? 'Already have an account? Log in' : 'Need an account? Register'}
                </button>
            </div>
        );
    }

    // GŁÓWNY EKRAN PO ZALOGOWANIU
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>Welcome, {user.username}!</h2>
                <button onClick={() => setUser(null)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>

            {/* SEKCJA ZADAŃ (TASKS) */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', borderLeft: '5px solid #17a2b8' }}>
                <h3>Add New Task (CRUD 1)</h3>
                <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input type="text" placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
                    <button type="submit" style={{ padding: '8px 15px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Task</button>
                </form>

                <h4>Your Tasks List</h4>
                {tasks.length === 0 ? <p>No tasks found.</p> : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {tasks.map(t => (
                            <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                                <div><strong>{t.title}</strong></div>
                                <button onClick={() => deleteTask(t.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* SEKCJA SPOTKAŃ (MEETINGS) */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #28a745' }}>
                <h3>Add New Meeting (CRUD 2)</h3>
                <form onSubmit={addMeeting} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input type="text" placeholder="Meeting Title" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
                    <input type="text" placeholder="Description" value={meetingDesc} onChange={e => setMeetingDesc(e.target.value)} required style={{ padding: '8px', flex: 2 }} />
                    <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Meeting</button>
                </form>

                <h4>Your Meetings List</h4>
                {meetings.length === 0 ? <p>No meetings scheduled.</p> : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {meetings.map(m => (
                            <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                                <div><strong>{m.title}</strong> - {m.description}</div>
                                <button onClick={() => deleteMeeting(m.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}