import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('ultra:todos:v1');
      return raw ? JSON.parse(raw) : sampleTasks();
    } catch (e) {
      return sampleTasks();
    }
  });

  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState('all');
  const [loadingDemo, setLoadingDemo] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ultra:todos:v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent };
  }, [tasks]);

  function addTask(e) { e?.preventDefault(); const t = text.trim(); if(!t) return; setTasks(prev => [{ id: uid(), text: t, done: false, createdAt: Date.now() }, ...prev]); setText(''); }
  function removeTask(id){ setTasks(prev => prev.filter(x => x.id!==id)); if(editingId===id) cancelEdit(); }
  function toggleDone(id){ setTasks(prev => prev.map(x => x.id===id ? {...x, done: !x.done} : x)); }
  function startEdit(task){ setEditingId(task.id); setEditingText(task.text); }
  function saveEdit(id){ const t = editingText.trim(); if(!t) return; setTasks(prev => prev.map(x => x.id===id ? {...x, text:t} : x)); setEditingId(null); setEditingText(''); }
  function cancelEdit(){ setEditingId(null); setEditingText(''); }
  function clearCompleted(){ setTasks(prev => prev.filter(x => !x.done)); }
  function completeAll(){ setTasks(prev => prev.map(x => ({...x, done:true}))); }
  function reorderIncompleteFirst(){ setTasks(prev => [...prev].sort((a,b)=>Number(a.done)-Number(b.done)||b.createdAt-a.createdAt)); }
  function loadLovelyDemo(){ setLoadingDemo(true); setTimeout(()=>{ setTasks(generateLovelyDemo()); setLoadingDemo(false); },700); }

  const visible = tasks.filter(t=>{
    if(filter==='active') return !t.done;
    if(filter==='completed') return t.done;
    return true;
  });

  const styles = {
    container: { minHeight:'100vh', background:'linear-gradient(135deg,#0f172a,#071233)', padding:'24px', display:'flex', justifyContent:'center', alignItems:'center', fontFamily:'Arial,sans-serif', color:'#fff' },
    card: { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(8px)', borderRadius:'24px', border:'1px solid rgba(255,255,255,0.1)', width:'90%', maxWidth:'900px', overflow:'hidden' },
    header: { textAlign:'center', marginBottom:'24px' },
    title: { fontSize:'32px', fontWeight:'800', background:'linear-gradient(90deg,#f472b6,#818cf8,#22d3ee)', WebkitBackgroundClip:'text', color:'transparent' },
    input: { width:'100%', padding:'12px 48px 12px 16px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'14px' },
    button: { padding:'8px 16px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'600' },
    taskItem: { display:'flex', alignItems:'center', gap:'12px', padding:'12px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)' },
    filterBtn: active => ({ padding:'6px 12px', borderRadius:'12px', fontSize:'14px', cursor:'pointer', background:active?'#818cf8':'rgba(255,255,255,0.1)', marginRight:'4px' })
  };

  return (
    <div style={styles.container}>
      <div style={{width:'100%'}}>
        <header style={styles.header}>
          <h1 style={styles.title}>Rebik Todos</h1>
          <p>Organize your tasks, track your progress, and get things done — simple, fast, and satisfying.</p>

        </header>

        <div style={styles.card}>
          <div style={{padding:'24px'}}>
            <form onSubmit={addTask} style={{display:'flex', gap:'12px', marginBottom:'16px'}}>
              <input ref={inputRef} value={text} onChange={e=>setText(e.target.value)} placeholder="What would you like to accomplish today?" style={styles.input}/>
              <button type="submit" style={{...styles.button, background:'#f472b6', color:'#fff'}}> <Plus size={16}/> Add </button>
            </form>

            <div style={{marginBottom:'16px'}}>
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={()=>setFilter('all')} style={styles.filterBtn(filter==='all')}>All</button>
                <button onClick={()=>setFilter('active')} style={styles.filterBtn(filter==='active')}>Active</button>
                <button onClick={()=>setFilter('completed')} style={styles.filterBtn(filter==='completed')}>Completed</button>
              </div>
              <p>{stats.done}/{stats.total} done • {stats.percent}%</p>
            </div>

            <div>
              <AnimatePresence>
                {visible.map(task=>(
                  <motion.div key={task.id} layout style={styles.taskItem} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}>
                    <button onClick={()=>toggleDone(task.id)} style={{width:'36px', height:'36px', borderRadius:'12px', border:'none', background:task.done?'#22c55e':'#fff3'}}>{task.done?<Check size={18}/>:<div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#fff4'}}/>}</button>
                    <div style={{flex:1}}>
                      {editingId===task.id ? (
                        <input autoFocus value={editingText} onChange={e=>setEditingText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') saveEdit(task.id); if(e.key==='Escape') cancelEdit(); }} style={{width:'100%', padding:'8px', borderRadius:'8px'}} />
                      ) : (
                        <div style={{textDecoration:task.done?'line-through':'none'}}>{task.text}</div>
                      )}
                    </div>
                    {editingId!==task.id && (
                      <div style={{display:'flex', gap:'4px'}}>
                        <button onClick={()=>startEdit(task)}>Edit</button>
                        <button onClick={()=>removeTask(task.id)}>Delete</button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function sampleTasks(){ return [{id:uid(),text:'Finish project',done:false,createdAt:Date.now()-1000*60*60*24},{id:uid(),text:'Practice LeetCode',done:true,createdAt:Date.now()-1000*60*60*48}]; }
function generateLovelyDemo(){ const items=['Plan a micro-project','Build a Todo UI','Practice Codeforces','Read DB chapter','Workout']; return items.map((t,i)=>({id:uid(),text:t,done:i%2===0?false:true,createdAt:Date.now()-i*1000*60*60})); }
