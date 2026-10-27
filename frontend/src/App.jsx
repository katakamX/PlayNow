import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from './api';

const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [news, setNews] = useState([]);
  const [tab, setTab] = useState('Explore');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All sports');
  const [authMode, setAuthMode] = useState('login');
  const [auth, setAuth] = useState({ name: '', email: '', password: '' });
  const [booking, setBooking] = useState({ venueId: '', date: today(), startTime: '18:00', endTime: '19:00' });
  const [gameForm, setGameForm] = useState({ title: '', sport: 'Badminton', location: '', date: today(), time: '18:00', maxPlayers: 4, description: '' });
  const [venueForm, setVenueForm] = useState({ name: '', sport: 'Badminton', location: '', pricePerHour: 500, description: '' });
  const [chatText, setChatText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const notify = text => { setNotice(text); setTimeout(() => setNotice(''), 3500); };
  async function loadPublic() {
    try {
      const [v, g, n] = await Promise.all([api.get('/venues'), api.get('/games'), api.get('/news')]);
      setVenues(v.data.venues || []); setGames(g.data.games || []); setNews(n.data.articles || []);
    } catch { /* backend may not be running yet */ }
  }
  async function loadPrivate() {
    try {
      const [b, p] = await Promise.all([api.get('/bookings/mine'), api.get('/users')]);
      setBookings(b.data.bookings || []); setPlayers(p.data.users || []);
    } catch (e) { notify(e.response?.data?.message || 'Could not load your account data.'); }
  }
  useEffect(() => {
    loadPublic();
    const token = localStorage.getItem('playnow_token');
    if (token) api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('playnow_token'));
  }, []);
  useEffect(() => { if (user) loadPrivate(); }, [user]);
  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    s.emit('chat:join', 'playnow-lobby');
    s.on('chat:message', m => setChatMessages(prev => [...prev.slice(-49), m]));
    setSocket(s);
    return () => s.disconnect();
  }, []);

  async function submitAuth(e) {
    e.preventDefault();
    try {
      const { data } = await api.post(`/auth/${authMode === 'register' ? 'register' : 'login'}`, auth);
      localStorage.setItem('playnow_token', data.token); setUser(data.user); notify(`Welcome${data.user.name ? `, ${data.user.name}` : ''}!`);
    } catch (e) { notify(e.response?.data?.message || 'Authentication failed.'); }
  }
  function logout() { localStorage.removeItem('playnow_token'); setUser(null); setBookings([]); notify('You have logged out.'); }
  async function makeBooking(e) {
    e.preventDefault();
    try { await api.post('/bookings', booking); notify('Booking created!'); loadPrivate(); }
    catch (e) { notify(e.response?.data?.message || 'Could not create booking.'); }
  }
  async function createGame(e) {
    e.preventDefault();
    try { await api.post('/games', gameForm); notify('Game created!'); setGameForm({ ...gameForm, title: '', description: '' }); loadPublic(); }
    catch (e) { notify(e.response?.data?.message || 'Could not create game.'); }
  }
  async function joinGame(id) {
    try { await api.post(`/games/${id}/join`); notify('You joined the game!'); loadPublic(); }
    catch (e) { notify(e.response?.data?.message || 'Could not join game.'); }
  }
  async function cancelBooking(id) {
    try { await api.patch(`/bookings/${id}/cancel`); notify('Booking cancelled.'); loadPrivate(); }
    catch (e) { notify(e.response?.data?.message || 'Could not cancel booking.'); }
  }
  async function addVenue(e) {
    e.preventDefault();
    try { await api.post('/venues', venueForm); notify('Venue added.'); setVenueForm({ ...venueForm, name: '' }); loadPublic(); }
    catch (e) { notify(e.response?.data?.message || 'Could not add venue. Check admin role.'); }
  }
  function sendChat(e) {
    e.preventDefault();
    if (!user) return notify('Log in to use chat.');
    if (!chatText.trim()) return;
    socket?.emit('chat:message', { room: 'playnow-lobby', text: chatText, sender: user.name });
    setChatText('');
  }

  const filteredVenues = venues.filter(v => (sport === 'All sports' || v.sport.toLowerCase() === sport.toLowerCase()) &&
    `${v.name} ${v.location} ${v.sport}`.toLowerCase().includes(search.toLowerCase()));
  const tabs = ['Explore', 'Games', 'Players', 'My bookings', 'Chat', 'Sports news', ...(user?.role === 'admin' ? ['Admin'] : [])];

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setTab('Explore'); }}><span className="brand-mark">P</span><span>play<span className="brand-accent">now</span><small>YOUR GAME. YOUR PEOPLE.</small></span></a>
      <nav>{tabs.map(t => <button key={t} className={tab === t ? 'nav-link active' : 'nav-link'} onClick={() => setTab(t)}>{t}</button>)}</nav>
      <div className="account">{user ? <><span className="avatar">{user.name?.[0]?.toUpperCase()}</span><span className="account-name">{user.name}</span><button className="button button-quiet small" onClick={logout}>Log out</button></> : <button className="button button-light small" onClick={() => document.getElementById('auth-panel')?.scrollIntoView({ behavior: 'smooth' })}>Log in</button>}</div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="live-dot"></span> THE GAME STARTS HERE</div>
          <h1>Less scrolling.<br/><span>More playing.</span></h1>
          <p>Find your court, build your squad, and get in the game. Your next match is closer than you think.</p>
          <div className="hero-actions"><button className="button button-green" onClick={() => { setTab('Explore'); document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' }); }}>Find a venue <span>↗</span></button><button className="button button-outline" onClick={() => { setTab('Games'); document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' }); }}>Find a game</button></div>
          <div className="hero-stats"><div><strong>{venues.length}+</strong><span>venues listed</span></div><i></i><div><strong>{games.length}+</strong><span>upcoming games</span></div><i></i><div><strong>{players.length + (user ? 1 : 0)}+</strong><span>players to meet</span></div></div>
        </div>
        <div className="hero-art"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div><div className="court"><div className="court-line center-line"></div><div className="court-line box-top"></div><div className="court-line box-bottom"></div><div className="court-line mid-net"></div><div className="court-label">PLAY YOUR WAY</div></div><div className="floating-card card-top"><span className="mini-icon">✦</span><span><b>Game on.</b><small>Your people are waiting.</small></span></div><div className="floating-card card-bottom"><span className="green-check">✓</span><span><b>Made for players</b><small>From first serve to final whistle.</small></span></div></div>
      </section>

      <section className="content-section" id="content">
        <div className="section-heading"><div><div className="eyebrow">MAKE IT HAPPEN</div><h2>{tab === 'Explore' ? 'Find your next court.' : tab === 'Games' ? 'Games looking for players.' : tab}</h2><p>{tab === 'Explore' ? 'Good venues. Great games. Zero guesswork.' : 'Everything you need to get out and play.'}</p></div>
          {tab === 'Explore' && <button className="button button-dark" onClick={() => setTab('Games')}>Explore games ↗</button>}
        </div>

        {tab === 'Explore' && <>
          <div className="filters"><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venues or locations"/></div><select value={sport} onChange={e => setSport(e.target.value)}><option>All sports</option>{['Badminton','Football','Cricket','Tennis','Basketball','Swimming','Table tennis'].map(s => <option key={s}>{s}</option>)}</select><span className="result-count">{filteredVenues.length} venues</span></div>
          <div className="venue-grid">{filteredVenues.map((v, i) => <article className="venue-card" key={v._id}><div className={`venue-image image-${i % 4}`}><span className="sport-chip">{v.sport}</span><span className="venue-number">0{i + 1}</span></div><div className="venue-info"><div className="venue-location">⌖ {v.location}</div><h3>{v.name}</h3><p>{v.description || `A place to play ${v.sport.toLowerCase()} and bring your game.`}</p><div className="venue-bottom"><div><strong>{money(v.pricePerHour)}</strong><span> / hour</span></div><button className="button button-green small" onClick={() => { setBooking({ ...booking, venueId: v._id }); if (!user) notify('Log in first to book a venue.'); else { setTab('My bookings'); document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' }); } }}>Book slot ↗</button></div></div></article>)}
            {!filteredVenues.length && <div className="empty-state"><div>⌁</div><h3>No venues just yet</h3><p>Try another filter, or add venues using an admin account.</p></div>}
          </div>
        </>}

        {tab === 'Games' && <><div className="game-grid">{games.map(g => <article className="game-card" key={g._id}><div className="game-top"><span className="sport-chip">{g.sport}</span><span className="game-date">{g.date} · {g.time}</span></div><h3>{g.title}</h3><p>⌖ {g.location}</p><p>{g.description || 'Come along and enjoy a game.'}</p><div className="game-bottom"><span>{g.players?.length || 0} / {g.maxPlayers} players</span><button className="button button-green small" disabled={!user || (g.players || []).some(p => p._id === user.id || p === user.id)} onClick={() => joinGame(g._id)}>{!user ? 'Log in to join' : 'Join game ↗'}</button></div></article>)}</div>
          {user && <form className="form-panel" onSubmit={createGame}><h3>Host a game</h3><div className="form-grid"><label>Game title<input required value={gameForm.title} onChange={e => setGameForm({...gameForm,title:e.target.value})} placeholder="Sunday badminton"/></label><label>Sport<select value={gameForm.sport} onChange={e => setGameForm({...gameForm,sport:e.target.value})}>{['Badminton','Football','Cricket','Tennis','Basketball','Swimming','Table tennis'].map(s=><option key={s}>{s}</option>)}</select></label><label>Location<input required value={gameForm.location} onChange={e => setGameForm({...gameForm,location:e.target.value})} placeholder="Indiranagar, Bengaluru"/></label><label>Date<input required type="date" min={today()} value={gameForm.date} onChange={e => setGameForm({...gameForm,date:e.target.value})}/></label><label>Time<input required type="time" value={gameForm.time} onChange={e => setGameForm({...gameForm,time:e.target.value})}/></label><label>Max players<input required type="number" min="2" max="100" value={gameForm.maxPlayers} onChange={e => setGameForm({...gameForm,maxPlayers:e.target.value})}/></label></div><label>Description<textarea value={gameForm.description} onChange={e => setGameForm({...gameForm,description:e.target.value})} placeholder="Skill level, equipment, details..."/></label><button className="button button-green">Create game</button></form>}</>}

        {tab === 'Players' && <div className="people-grid">{players.map(p=><article className="person-card" key={p._id}><div className="person-avatar">{p.name?.[0]?.toUpperCase()}</div><h3>{p.name}</h3><span className="skill-tag">{p.skillLevel || 'Beginner'}</span><p>{p.bio || 'Here to find a game and meet new players.'}</p><div className="tag-row">{(p.sports || []).map(s=><span key={s}>{s}</span>)}</div></article>)}</div>}

        {tab === 'My bookings' && <><div className="booking-list">{bookings.map(b=><article className="booking-row" key={b._id}><div className="booking-icon">▦</div><div className="booking-main"><h3>{b.venue?.name || 'Sports venue'}</h3><p>{b.venue?.location} · {b.date} · {b.startTime}–{b.endTime}</p></div><span className={`status ${b.status}`}>{b.status}</span>{b.status === 'confirmed' && <button className="button button-quiet small" onClick={() => cancelBooking(b._id)}>Cancel</button>}</article>)}{user && !bookings.length && <div className="empty-state"><h3>No bookings yet</h3><p>Find a venue and reserve your first slot.</p><button className="button button-green" onClick={() => setTab('Explore')}>Browse venues</button></div>}{!user && <div className="empty-state"><h3>Log in to view bookings</h3><p>Your upcoming games will show up here.</p></div>}</div>
          <form className="form-panel" id="booking-form" onSubmit={makeBooking}><h3>Book a venue</h3><div className="form-grid"><label>Venue<select required value={booking.venueId} onChange={e=>setBooking({...booking,venueId:e.target.value})}><option value="">Choose a venue</option>{venues.map(v=><option key={v._id} value={v._id}>{v.name} — {v.location}</option>)}</select></label><label>Date<input type="date" required min={today()} value={booking.date} onChange={e=>setBooking({...booking,date:e.target.value})}/></label><label>Start time<input type="time" required value={booking.startTime} onChange={e=>setBooking({...booking,startTime:e.target.value})}/></label><label>End time<input type="time" required value={booking.endTime} onChange={e=>setBooking({...booking,endTime:e.target.value})}/></label></div><button className="button button-green" disabled={!user}>Confirm booking</button>{!user && <small className="form-hint">Log in first to book.</small>}</form></>}

        {tab === 'Chat' && <div className="chat-panel"><div className="chat-head"><div className="online-dot"></div><div><h3>PlayNow lobby</h3><p>Say hello to the community</p></div></div><div className="chat-messages">{chatMessages.map((m,i)=><div className="chat-message" key={`${m.createdAt}-${i}`}><b>{m.sender}</b><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div>)}{!chatMessages.length && <div className="empty-state"><p>No messages yet. Start the conversation.</p></div>}</div><form className="chat-form" onSubmit={sendChat}><input value={chatText} onChange={e=>setChatText(e.target.value)} placeholder={user ? 'Write a message...' : 'Log in to send messages'} disabled={!user}/><button className="button button-green" disabled={!user}>Send ↗</button></form><small className="form-hint">Demo lobby chat. Messages are not persisted in the database in this starter.</small></div>}

        {tab === 'Sports news' && <div className="news-grid">{news.map((n,i)=><a className="news-card" key={n.url || i} href={n.url} target="_blank" rel="noreferrer">{n.image && <img src={n.image} alt=""/>}<div className="news-body"><span className="eyebrow">{n.source || 'SPORTS NEWS'}</span><h3>{n.title}</h3><p>{n.description}</p><small>{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : ''}</small></div></a>)}{!news.length && <div className="empty-state"><h3>Sports news is waiting</h3><p>Add a GNews API key in backend/.env to load current articles.</p></div>}</div>}

        {tab === 'Admin' && user?.role === 'admin' && <form className="form-panel" onSubmit={addVenue}><h3>Add a sports venue</h3><div className="form-grid"><label>Venue name<input required value={venueForm.name} onChange={e=>setVenueForm({...venueForm,name:e.target.value})}/></label><label>Sport<select value={venueForm.sport} onChange={e=>setVenueForm({...venueForm,sport:e.target.value})}>{['Badminton','Football','Cricket','Tennis','Basketball','Swimming','Table tennis'].map(s=><option key={s}>{s}</option>)}</select></label><label>Location<input required value={venueForm.location} onChange={e=>setVenueForm({...venueForm,location:e.target.value})}/></label><label>Price per hour (₹)<input required type="number" min="0" value={venueForm.pricePerHour} onChange={e=>setVenueForm({...venueForm,pricePerHour:e.target.value})}/></label></div><label>Description<textarea value={venueForm.description} onChange={e=>setVenueForm({...venueForm,description:e.target.value})}/></label><button className="button button-green">Add venue</button></form>}
      </section>

      <section className="community-banner"><div><div className="eyebrow">YOUR NEXT GAME IS OUT THERE</div><h2>Good games start<br/>with good people.</h2><p>Find your people. Find your place. Play now.</p></div><button className="button button-light" onClick={()=>{ if (!user) { document.getElementById('auth-panel')?.scrollIntoView({behavior:'smooth'}); } else setTab('Games'); }}>Get in the game ↗</button></section>

      {!user && <section className="auth-section" id="auth-panel"><div><div className="eyebrow">JOIN THE COMMUNITY</div><h2>Every player starts somewhere.</h2><p>Create your account and find your next game.</p></div><form className="auth-card" onSubmit={submitAuth}><div className="auth-toggle"><button type="button" className={authMode==='login'?'selected':''} onClick={()=>setAuthMode('login')}>Log in</button><button type="button" className={authMode==='register'?'selected':''} onClick={()=>setAuthMode('register')}>Create account</button></div>{authMode==='register' && <label>Your name<input required value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} placeholder="Alex Morgan"/></label>}<label>Email address<input required type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required type="password" minLength="8" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} placeholder="At least 8 characters"/></label><button className="button button-green full">{authMode==='login'?'Log in ↗':'Create account ↗'}</button></form></section>}

    </main>
    <footer><a className="brand" href="#"><span className="brand-mark">P</span><span>play<span className="brand-accent">now</span><small>YOUR GAME. YOUR PEOPLE.</small></span></a><span>Built for people who love to play.</span><span>© {new Date().getFullYear()} PlayNow</span></footer>
    {notice && <div className="toast">{notice}</div>}
  </div>;
}
