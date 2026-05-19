import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaEye,
  FaCheck,
  FaXmark,
  FaClock,
  FaShieldHalved,
  FaPhone,
  FaGlobe,
  FaRotateRight,
  FaRightFromBracket,
} from 'react-icons/fa6';

const API_URL = import.meta.env.REACT_APP_API_URL || 'https://graduate-9sim.vercel.app';

type Member = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  guests: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  role?: 'member' | 'admin';
  createdAt: string;
  meta?: {
    ip?: string;
    userAgent?: string;
    path?: string;
    language?: string;
  };
};

type Visit = {
  _id: string;
  page: string;
  title?: string;
  timezone?: string;
  createdAt: string;
  meta?: {
    ip?: string;
    userAgent?: string;
    referer?: string;
    language?: string;
  };
};

type Stats = {
  visits: number;
  members: number;
  pendingMembers: number;
  approvedMembers: number;
};

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || 'Request failed');
  return data as T;
}

function GlobalAdminStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      body { margin: 0; background: #060713; }
      .admin-page {
        min-height: 100vh;
        color: white;
        background:
          radial-gradient(circle at 10% 10%, rgba(248,215,122,.18), transparent 28rem),
          radial-gradient(circle at 88% 16%, rgba(100,92,255,.25), transparent 32rem),
          radial-gradient(circle at 50% 105%, rgba(66,194,255,.13), transparent 30rem),
          linear-gradient(135deg, #060713, #11142b 52%, #060713);
        font-family: Inter, Montserrat, system-ui, sans-serif;
        padding: 24px;
      }
      .admin-container { width: min(1280px, 100%); margin: 0 auto; }
      .admin-glass {
        background: linear-gradient(145deg, rgba(255,255,255,.15), rgba(255,255,255,.045));
        border: 1px solid rgba(255,255,255,.16);
        box-shadow: 0 28px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.1);
        backdrop-filter: blur(22px) saturate(135%);
      }
      .gold-text {
        background: linear-gradient(135deg, #fff8dc, #f8d77a 34%, #fff, #c79a36);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .admin-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
      .admin-layout { display: grid; grid-template-columns: 1.15fr .85fr; gap: 18px; margin-top: 18px; }
      .admin-input {
        width: 100%; border: 1px solid rgba(255,255,255,.16); outline: none;
        border-radius: 18px; padding: 14px 15px; color: white;
        background: rgba(255,255,255,.09); box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
      }
      .admin-button {
        border: 0; border-radius: 999px; padding: 13px 18px; cursor: pointer;
        font-weight: 950; color: #090a18;
        background: linear-gradient(135deg, #fff7d6, #f8d77a, #c79a36);
        box-shadow: 0 18px 42px rgba(248,215,122,.2);
      }
      .ghost-button {
        border: 1px solid rgba(255,255,255,.16); border-radius: 999px; padding: 11px 15px;
        cursor: pointer; color: white; background: rgba(255,255,255,.08); font-weight: 900;
      }
      .soft-text { color: rgba(255,255,255,.68); }
      .table-row { display: grid; grid-template-columns: 1.2fr .9fr .65fr .8fr auto; gap: 12px; align-items: center; }
      @media (max-width: 1050px) { .admin-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .admin-layout { grid-template-columns: 1fr; } }
      @media (max-width: 720px) { .admin-page { padding: 12px; } .admin-grid { grid-template-columns: 1fr; } .table-row { grid-template-columns: 1fr; } }
    `}</style>
  );
}

function StatCard({ icon: Icon, label, value, delay }: { icon: any; label: string; value: number; delay: number }) {
  return (
    <motion.div
      className="admin-glass"
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 140, damping: 18 }}
      whileHover={{ y: -6, scale: 1.02 }}
      style={{ borderRadius: 26, padding: 20, overflow: 'hidden', position: 'relative' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 18, background: 'rgba(248,215,122,.14)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
        <Icon color="#f8d77a" />
      </div>
      <div className="gold-text" style={{ fontSize: 38, fontWeight: 950, letterSpacing: '-.07em' }}>{value}</div>
      <div className="soft-text" style={{ fontWeight: 900 }}>{label}</div>
    </motion.div>
  );
}

function StatusPill({ status }: { status: Member['status'] }) {
  const color = status === 'approved' ? '#a7f3d0' : status === 'rejected' ? '#ffb2c6' : '#fde68a';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content', borderRadius: 999, padding: '7px 11px', background: `${color}22`, color, fontSize: 12, fontWeight: 950 }}>
      {status === 'approved' ? 'Հաստատված' : status === 'rejected' ? 'Մերժված' : 'Սպասման մեջ'}
    </span>
  );
}

export default function PremiumAdminPanel() {
  const [phone, setPhone] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'visits'>('members');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredPending = useMemo(() => members.filter((member) => member.status === 'pending').length, [members]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ phone, adminSecret }),
      });
      setIsLoggedIn(true);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [statsData, membersData, visitsData] = await Promise.all([
        apiRequest<{ success: boolean; stats: Stats }>('/api/admin/stats'),
        apiRequest<{ success: boolean; items: Member[] }>('/api/admin/members?limit=100'),
        apiRequest<{ success: boolean; items: Visit[] }>('/api/admin/visits?limit=80'),
      ]);
      setStats(statsData.stats);
      setMembers(membersData.items);
      setVisits(visitsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
      if (err instanceof Error && /auth|admin|token|required/i.test(err.message)) setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }

  async function updateMemberStatus(id: string, status: Member['status']) {
    setError('');
    try {
      await apiRequest(`/api/admin/members/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMembers((prev) => prev.map((member) => (member._id === id ? { ...member, status } : member)));
      setStats((prev) => {
        if (!prev) return prev;
        const updated = members.map((member) => (member._id === id ? { ...member, status } : member));
        return {
          ...prev,
          pendingMembers: updated.filter((member) => member.status === 'pending').length,
          approvedMembers: updated.filter((member) => member.status === 'approved').length,
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    }
  }

  async function logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setIsLoggedIn(false);
    setStats(null);
    setMembers([]);
    setVisits([]);
  }

  useEffect(() => {
    apiRequest('/api/auth/me')
      .then((data: any) => {
        if (data?.currentUser?.role === 'admin') {
          setIsLoggedIn(true);
          loadDashboard();
        }
      })
      .catch(() => null);
  }, []);

  return (
    <div className="admin-page">
      <GlobalAdminStyles />
      <div className="admin-container">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>

          {isLoggedIn && (
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: .97 }} className="ghost-button" onClick={loadDashboard} disabled={loading}>
                <FaRotateRight /> Refresh
              </motion.button>
              <motion.button whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: .97 }} className="ghost-button" onClick={logout}>
                <FaRightFromBracket /> Logout
              </motion.button>
            </div>
          )}
        </motion.header>

        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.form key="login" onSubmit={login} className="admin-glass" initial={{ opacity: 0, y: 28, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 28, scale: .96 }} style={{ width: 'min(520px, 100%)', margin: '56px auto', borderRadius: 34, padding: 28 }}>
              <div style={{ width: 58, height: 58, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'rgba(248,215,122,.14)', marginBottom: 18 }}>
                <FaShieldHalved color="#f8d77a" size={26} />
              </div>
              <h2 style={{ margin: 0, fontSize: 34, letterSpacing: '-.05em' }}>Admin Login</h2>
              <p className="soft-text" style={{ lineHeight: 1.6 }}>Մուտք գործիր admin secret-ով, հետո կտեսնես գրանցումները և այցելությունները։</p>

              <label style={{ display: 'grid', gap: 8, marginTop: 18 }}>
                <span style={{ fontWeight: 900, color: 'rgba(255,255,255,.76)' }}>Admin phone</span>
                <input className="admin-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+374..." />
              </label>
              <label style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <span style={{ fontWeight: 900, color: 'rgba(255,255,255,.76)' }}>Admin secret</span>
                <input className="admin-input" type="password" value={adminSecret} onChange={(event) => setAdminSecret(event.target.value)} placeholder="ADMIN_SECRET from .env" />
              </label>

              {error && <div style={{ color: '#ffb2c6', fontWeight: 900, marginTop: 14 }}>{error}</div>}

              <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: .97 }} disabled={loading} className="admin-button" style={{ width: '100%', marginTop: 18 }}>
                {loading ? 'Loading...' : 'Login'}
              </motion.button>
            </motion.form>
          ) : (
            <motion.main key="dashboard" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 22 }}>
              {error && <div className="admin-glass" style={{ borderRadius: 20, padding: 14, color: '#ffb2c6', fontWeight: 900, marginBottom: 14 }}>{error}</div>}

              <div className="admin-grid">
                <StatCard icon={FaEye} label="Visits" value={stats?.visits || 0} delay={0} />
                <StatCard icon={FaUsers} label="Members" value={stats?.members || 0} delay={0.06} />
                <StatCard icon={FaClock} label="Pending" value={stats?.pendingMembers ?? filteredPending} delay={0.12} />
                <StatCard icon={FaCheck} label="Approved" value={stats?.approvedMembers || 0} delay={0.18} />
              </div>

              <div className="admin-layout">
                <section className="admin-glass" style={{ borderRadius: 30, padding: 20, minHeight: 520 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ margin: 0, fontSize: 28, letterSpacing: '-.04em' }}>Members</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="ghost-button" onClick={() => setActiveTab('members')} style={{ background: activeTab === 'members' ? 'rgba(248,215,122,.18)' : undefined }}>Members</button>
                      <button className="ghost-button" onClick={() => setActiveTab('visits')} style={{ background: activeTab === 'visits' ? 'rgba(248,215,122,.18)' : undefined }}>Visits</button>
                    </div>
                  </div>

                  {activeTab === 'members' ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {members.map((member) => (
                        <motion.div key={member._id} layout className="admin-glass table-row" style={{ borderRadius: 22, padding: 14 }}>
                          <div>
                            <div style={{ fontWeight: 950 }}>{member.firstName} {member.lastName}</div>
                            <div className="soft-text" style={{ fontSize: 13, marginTop: 4 }}>{member.note || 'No note'}</div>
                          </div>
                          <div className="soft-text" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><FaPhone /> {member.phone}</div>
                          <div style={{ fontWeight: 900 }}>{member.guests} guests</div>
                          <StatusPill status={member.status} />
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="ghost-button" onClick={() => updateMemberStatus(member._id, 'approved')} title="Approve"><FaCheck /></button>
                            <button className="ghost-button" onClick={() => updateMemberStatus(member._id, 'rejected')} title="Reject"><FaXmark /></button>
                            <button className="ghost-button" onClick={() => updateMemberStatus(member._id, 'pending')} title="Pending"><FaClock /></button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {visits.map((visit) => (
                        <motion.div key={visit._id} layout className="admin-glass" style={{ borderRadius: 22, padding: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 950 }}>{visit.page}</div>
                            <div className="soft-text" style={{ fontSize: 13 }}>{new Date(visit.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="soft-text" style={{ marginTop: 8, display: 'grid', gap: 5 }}>
                            <span><FaGlobe /> IP: {visit.meta?.ip || 'unknown'}</span>
                            <span>Timezone: {visit.timezone || 'unknown'}</span>
                            <span>User-Agent: {visit.meta?.userAgent || 'unknown'}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>

                <aside className="admin-glass" style={{ borderRadius: 30, padding: 20, minHeight: 520 }}>
                  <h2 style={{ margin: 0, fontSize: 28, letterSpacing: '-.04em' }}>Latest Details</h2>
                  <p className="soft-text" style={{ lineHeight: 1.6 }}>Այստեղ արագ տեսնում ես վերջին գրանցումները, IP/User-Agent տվյալները և անդամների վիճակագրությունը։</p>

                  <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                    {members.slice(0, 6).map((member) => (
                      <div key={member._id} className="admin-glass" style={{ borderRadius: 22, padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <strong>{member.firstName} {member.lastName}</strong>
                          <StatusPill status={member.status} />
                        </div>
                        <div className="soft-text" style={{ marginTop: 8, fontSize: 13 }}>IP: {member.meta?.ip || 'unknown'}</div>
                        <div className="soft-text" style={{ marginTop: 4, fontSize: 13 }}>Joined: {new Date(member.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
