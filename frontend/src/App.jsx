import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const emptyProfile = { full_name:"", email:"", phone:"", bio:"", location:"" };

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("skillswap_user") || "null"));
  const [page, setPage] = useState("home");
  const [message, setMessage] = useState("");

  function saveSession(data) {
    localStorage.setItem("skillswap_token", data.token);
    localStorage.setItem("skillswap_user", JSON.stringify(data.user));
    setUser(data.user);
    setPage("dashboard");
  }
  function logout() {
    localStorage.removeItem("skillswap_token");
    localStorage.removeItem("skillswap_user");
    setUser(null);
    setPage("home");
  }
  const nav = user ? [
    ["dashboard","Dashboard"],["find","Find Skills"],["skills","My Skills"],
    ["requests","Requests"],["sessions","Sessions"],["profile","Profile"]
  ] : [["home","Home"],["find","Browse Skills"]];

  return (
    <div className="app">
      <header className="nav">
        <button className="brand" onClick={() => setPage(user ? "dashboard" : "home")}>Skill<span>Swap</span></button>
        <nav>{nav.map(([id,label]) => <button key={id} onClick={() => setPage(id)}>{label}</button>)}</nav>
        <div className="nav-right">
          {user ? <><span className="user-chip">{user.full_name}</span><button className="ghost" onClick={logout}>Logout</button></>
            : <><button className="ghost" onClick={() => setPage("login")}>Login</button><button onClick={() => setPage("register")}>Get Started</button></>}
        </div>
      </header>

      {message && <div className="toast" onClick={() => setMessage("")}>{message}</div>}

      <main className="container">
        {page === "home" && <Home onStart={() => setPage(user ? "find" : "register")} />}
        {page === "login" && <Auth mode="login" onSuccess={saveSession} />}
        {page === "register" && <Auth mode="register" onSuccess={saveSession} />}
        {page === "dashboard" && user && <Dashboard user={user} setPage={setPage} />}
        {page === "find" && <FindSkills user={user} notify={setMessage} />}
        {page === "skills" && user && <MySkills notify={setMessage} />}
        {page === "profile" && user && <Profile notify={setMessage} updateUser={setUser} />}
        {page === "requests" && user && <Requests notify={setMessage} />}
        {page === "sessions" && user && <Sessions notify={setMessage} />}
      </main>
      <footer>SkillSwap · Learn a Skill. Share a Skill.</footer>
    </div>
  );
}

function Home({onStart}) {
  return <section>
    <div className="hero">
      <div>
        <span className="eyebrow">PEER-TO-PEER LEARNING</span>
        <h1>Learn a skill.<br/><span>Share a skill.</span></h1>
        <p>Connect with people who can teach what you want to learn while sharing what you know.</p>
        <button className="big" onClick={onStart}>Find a Skill →</button>
      </div>
      <div className="hero-card">
        <div className="mini-label">SKILL EXCHANGE</div>
        <h3>JavaScript ↔ Photoshop</h3>
        <p>Two people. Two skills. One useful exchange.</p>
        <div className="avatars"><span>SF</span><span>AP</span></div>
      </div>
    </div>
    <div className="section-head"><h2>How SkillSwap works</h2><p>Simple from start to finish.</p></div>
    <div className="grid three">
      {[
        ["01","Create your profile","Tell the community what you can teach and what you want to learn."],
        ["02","Find a match","Search skills and discover people with useful experience."],
        ["03","Swap & grow","Send a request, schedule a session, and review the experience."]
      ].map(x => <article className="card" key={x[0]}><span className="number">{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}
    </div>
  </section>
}

function Auth({mode,onSuccess}) {
  const [form,setForm] = useState(mode==="login"?{email:"sarah@example.com",password:"Password123!"}:{full_name:"",email:"",password:"",phone:"",bio:"",location:""});
  const [error,setError] = useState("");
  async function submit(e) {
    e.preventDefault(); setError("");
    try { onSuccess(await api(`/auth/${mode}`, {method:"POST", body:JSON.stringify(form)})); }
    catch(e){ setError(e.message); }
  }
  return <div className="auth-wrap"><form className="form-card" onSubmit={submit}>
    <span className="eyebrow">{mode==="login"?"WELCOME BACK":"JOIN THE COMMUNITY"}</span>
    <h2>{mode==="login"?"Sign in":"Create your account"}</h2>
    {mode==="register" && <Input label="Full name" value={form.full_name} onChange={v=>setForm({...form,full_name:v})}/>}
    <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})}/>
    <Input label="Password" type="password" value={form.password} onChange={v=>setForm({...form,password:v})}/>
    {mode==="register" && <>
      <Input label="Phone" value={form.phone} onChange={v=>setForm({...form,phone:v})}/>
      <Input label="Location" value={form.location} onChange={v=>setForm({...form,location:v})}/>
      <label>Bio<textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/></label>
    </>}
    {error && <div className="error">{error}</div>}
    <button className="big">{mode==="login"?"Sign In":"Create Account"}</button>
    {mode==="login" && <p className="hint">Demo: sarah@example.com / Password123!</p>}
  </form></div>
}

function Input({label,value,onChange,type="text"}) {
  return <label>{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} required={label!=="Phone"}/></label>
}

function Dashboard({user,setPage}) {
  const [stats,setStats]=useState({skills:0,requests:0,sessions:0});
  useEffect(()=>{ Promise.all([api("/skills/mine/list"),api("/requests/swap"),api("/requests/sessions")]).then(([a,b,c])=>setStats({skills:a.length,requests:b.filter(x=>x.status==="PENDING").length,sessions:c.filter(x=>x.status==="SCHEDULED").length})).catch(()=>{}); },[]);
  return <section>
    <div className="page-title"><div><span className="eyebrow">DASHBOARD</span><h1>Welcome, {user.full_name.split(" ")[0]}.</h1><p>Keep your skill exchange moving.</p></div></div>
    <div className="stats">
      <Stat label="Skills I teach" value={stats.skills}/><Stat label="Pending requests" value={stats.requests}/><Stat label="Upcoming sessions" value={stats.sessions}/>
    </div>
    <div className="grid three">
      <article className="card action" onClick={()=>setPage("find")}><h3>Find a skill</h3><p>Search for people who can teach what you want to learn.</p><b>Explore →</b></article>
      <article className="card action" onClick={()=>setPage("skills")}><h3>Manage my skills</h3><p>Add the skills you can confidently share with others.</p><b>Manage →</b></article>
      <article className="card action" onClick={()=>setPage("requests")}><h3>Review requests</h3><p>Accept, reject, or track your skill-swap requests.</p><b>Open requests →</b></article>
    </div>
  </section>
}
function Stat({label,value}){return <div className="stat"><span>{label}</span><strong>{value}</strong></div>}

function FindSkills({user,notify}) {
  const [skills,setSkills]=useState([]), [q,setQ]=useState(""), [selected,setSelected]=useState(null), [teachers,setTeachers]=useState([]);
  useEffect(()=>{api(`/skills?q=${encodeURIComponent(q)}`).then(setSkills).catch(()=>{})},[q]);
  async function view(skill){setSelected(skill); setTeachers(await api(`/skills/${skill.skill_id}/teachers`));}
  return <section>
    <div className="page-title"><div><span className="eyebrow">DISCOVER</span><h1>Find a skill</h1><p>Search skills and discover people who can teach them.</p></div></div>
    <input className="search" placeholder="Search JavaScript, Photoshop, Python..." value={q} onChange={e=>setQ(e.target.value)}/>
    <div className="grid three">
      {skills.map(s=><article className="card" key={s.skill_id}><span className="tag">{s.category_name}</span><h3>{s.skill_name}</h3><p>{s.teacher_count} teacher(s) available</p><button onClick={()=>view(s)}>View teachers</button></article>)}
    </div>
    {selected && <div className="overlay" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">TEACHERS</span><h2>{selected.skill_name}</h2>
      {teachers.map(t=><Teacher key={t.user_id} t={t} skill={selected} user={user} notify={notify}/>)}
      {!teachers.length && <p>No teachers found yet.</p>}
    </div></div>}
  </section>
}

function Teacher({t,skill,user,notify}) {
  const [open,setOpen]=useState(false), [requested,setRequested]=useState("");
  async function send(e){e.preventDefault(); try{await api("/requests/swap",{method:"POST",body:JSON.stringify({receiver_id:t.user_id,offered_skill_id:1,requested_skill_id:skill.skill_id,message:requested})}); notify("Swap request sent.");setOpen(false)}catch(e){notify(e.message)}}
  return <div className="teacher"><div><h3>{t.full_name}</h3><p>{t.location || "Location not specified"} · {t.proficiency_level} · {t.years_experience} yrs</p><p>{t.bio || "Ready to share skills."}</p></div>{user && user.user_id!==t.user_id && <button onClick={()=>setOpen(true)}>Request Swap</button>}
    {open && <form className="inline-form" onSubmit={send}><textarea placeholder="Tell them what you can offer..." value={requested} onChange={e=>setRequested(e.target.value)} required/><button>Send</button></form>}
  </div>
}

function MySkills({notify}) {
  const [skills,setSkills]=useState([]),[mine,setMine]=useState([]),[form,setForm]=useState({skill_id:"",proficiency_level:"Intermediate",years_experience:0});
  async function load(){setSkills(await api("/skills"));setMine(await api("/skills/mine/list"))}
  useEffect(()=>{load().catch(e=>notify(e.message))},[]);
  async function add(e){e.preventDefault();try{await api("/skills/mine",{method:"POST",body:JSON.stringify({...form,years_experience:Number(form.years_experience)})});notify("Skill added.");load()}catch(e){notify(e.message)}}
  async function del(id){try{await api(`/skills/mine/${id}`,{method:"DELETE"});load()}catch(e){notify(e.message)}}
  return <section><div className="page-title"><div><span className="eyebrow">MY SKILLS</span><h1>What I can teach</h1></div></div>
    <div className="split"><form className="form-card" onSubmit={add}><h3>Add a skill</h3><label>Skill<select value={form.skill_id} onChange={e=>setForm({...form,skill_id:e.target.value})} required><option value="">Choose...</option>{skills.map(s=><option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}</select></label><label>Proficiency<select value={form.proficiency_level} onChange={e=>setForm({...form,proficiency_level:e.target.value})}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><Input label="Years experience" type="number" value={form.years_experience} onChange={v=>setForm({...form,years_experience:v})}/><button className="big">Add Skill</button></form>
    <div><div className="grid">{mine.map(x=><article className="card" key={x.user_skill_id}><span className="tag">{x.category_name}</span><h3>{x.skill_name}</h3><p>{x.proficiency_level} · {x.years_experience} years</p><button className="danger" onClick={()=>del(x.user_skill_id)}>Remove</button></article>)}</div></div></div>
  </section>
}

function Profile({notify,updateUser}) {
  const [form,setForm]=useState(emptyProfile); useEffect(()=>{api("/users/me").then(setForm).catch(e=>notify(e.message))},[]);
  async function save(e){e.preventDefault();try{await api("/users/me",{method:"PUT",body:JSON.stringify(form)});const u=JSON.parse(localStorage.getItem("skillswap_user"));const next={...u,...form};localStorage.setItem("skillswap_user",JSON.stringify(next));updateUser(next);notify("Profile updated.")}catch(e){notify(e.message)}}
  return <section><div className="page-title"><div><span className="eyebrow">PROFILE</span><h1>Your profile</h1></div></div><form className="form-card wide" onSubmit={save}><Input label="Full name" value={form.full_name} onChange={v=>setForm({...form,full_name:v})}/><Input label="Email" value={form.email} onChange={()=>{}}/><Input label="Phone" value={form.phone||""} onChange={v=>setForm({...form,phone:v})}/><Input label="Location" value={form.location||""} onChange={v=>setForm({...form,location:v})}/><label>Bio<textarea value={form.bio||""} onChange={e=>setForm({...form,bio:e.target.value})}/></label><button className="big">Save Profile</button></form></section>
}

function Requests({notify}) {
  const [rows,setRows]=useState([]),[learning,setLearning]=useState([]),[skills,setSkills]=useState([]),[form,setForm]=useState({skill_id:"",description:""});
  async function load(){setRows(await api("/requests/swap"));setLearning(await api("/requests/learning/mine"));setSkills(await api("/skills"))}
  useEffect(()=>{load().catch(e=>notify(e.message))},[]);
  async function handleLearning(e){e.preventDefault();try{await api("/requests/learning",{method:"POST",body:JSON.stringify(form)});notify("Learning request created.");load()}catch(e){notify(e.message)}}
  async function action(id,status){try{await api(`/requests/swap/${id}`,{method:"PATCH",body:JSON.stringify({status})});notify(`Request ${status.toLowerCase()}.`);load()}catch(e){notify(e.message)}}
  return <section><div className="page-title"><div><span className="eyebrow">REQUESTS</span><h1>Skill exchange requests</h1></div></div>
    <div className="split"><form className="form-card" onSubmit={handleLearning}><h3>I want to learn</h3><label>Skill<select required value={form.skill_id} onChange={e=>setForm({...form,skill_id:e.target.value})}><option value="">Choose...</option>{skills.map(s=><option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}</select></label><label>Why do you want to learn it?<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><button className="big">Create Learning Request</button></form>
    <div><h3>Swap requests</h3>{rows.map(r=><article className="card request" key={r.swap_request_id}><div><h3>{r.requester_name} ↔ {r.receiver_name}</h3><p>{r.offered_skill} ↔ {r.requested_skill}</p><span className={`status ${r.status.toLowerCase()}`}>{r.status}</span></div>{r.status==="PENDING" && <div><button onClick={()=>action(r.swap_request_id,"ACCEPTED")}>Accept</button><button className="danger" onClick={()=>action(r.swap_request_id,"REJECTED")}>Reject</button></div>}</article>)}</div></div>
    <h3 className="subhead">My learning requests</h3>{learning.map(x=><div className="list-row" key={x.learning_req_id}><b>{x.skill_name}</b><span>{x.status}</span></div>)}
  </section>
}

function Sessions({notify}) {
  const [rows,setRows]=useState([]),[review,setReview]=useState({session_id:"",rating:5,comment:""});
  async function load(){setRows(await api("/requests/sessions"))}
  useEffect(()=>{load().catch(e=>notify(e.message))},[]);
  async function complete(id){try{await api(`/requests/sessions/${id}`,{method:"PATCH",body:JSON.stringify({status:"COMPLETED"})});notify("Session completed.");load()}catch(e){notify(e.message)}}
  async function submit(e){e.preventDefault();try{await api("/requests/reviews",{method:"POST",body:JSON.stringify(review)});notify("Review submitted.");setReview({session_id:"",rating:5,comment:""})}catch(e){notify(e.message)}}
  return <section><div className="page-title"><div><span className="eyebrow">SESSIONS</span><h1>Skill exchange sessions</h1></div></div>
    <div className="grid">{rows.map(r=><article className="card" key={r.session_id}><span className="tag">{r.status}</span><h3>{r.requester_name} ↔ {r.receiver_name}</h3><p>{r.offered_skill} ↔ {r.requested_skill}</p><p>📅 {String(r.session_date).slice(0,10)} · ⏰ {r.start_time} · {r.duration_minutes} minutes</p>{r.status==="SCHEDULED"&&<button onClick={()=>complete(r.session_id)}>Mark Completed</button>}{r.status==="COMPLETED"&&<button onClick={()=>setReview({...review,session_id:r.session_id})}>Review Session</button>}</article>)}</div>
    {review.session_id && <form className="form-card wide" onSubmit={submit}><h3>Review session</h3><label>Rating<select value={review.rating} onChange={e=>setReview({...review,rating:Number(e.target.value)})}>{[1,2,3,4,5].map(x=><option key={x}>{x}</option>)}</select></label><label>Comment<textarea value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})}/></label><button className="big">Submit Review</button></form>}
  </section>
}
