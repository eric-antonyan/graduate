import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FaCalendar,
  FaMapPin,
  FaUsers,
  FaClock,
  FaGift,
  FaGraduationCap,
  FaHeart,
  FaStar,
  FaMusic,
  FaCamera,
  FaTrophy,
  FaChevronRight,
} from 'react-icons/fa6';
import { GiPartyPopper } from 'react-icons/gi';

const students = [
  { id: 1, name: 'Արամ Հովհաննիսյան', quote: 'Միշտ առաջ՝ վստահ քայլերով', hobby: 'Սպորտ', accent: '#f8d77a' },
  { id: 2, name: 'Անի Սահակյան', quote: 'Երազանքը սկսվում է հավատից', hobby: 'Նկարչություն', accent: '#e7b9ff' },
  { id: 3, name: 'Սարգիս Կարապետյան', quote: 'Յուրաքանչյուր ավարտ նոր սկիզբ է', hobby: 'Տեխնոլոգիա', accent: '#8ee7ff' },
  { id: 4, name: 'Մարիամ Մարտիրոսյան', quote: 'Լույսը տանենք մեզ հետ', hobby: 'Երաժշտություն', accent: '#ffb2c6' },
  { id: 5, name: 'Դավիթ Ղազարյան', quote: 'Հաղթանակը ծնվում է աշխատանքից', hobby: 'Կարդալ', accent: '#a7f3d0' },
  { id: 6, name: 'Լուսինե Գրիգորյան', quote: 'Սիրտ, կամք, ապագա', hobby: 'Պար', accent: '#fde68a' },
  { id: 7, name: 'Հայկ Ավետիսյան', quote: 'Մեր պատմությունը շարունակվում է', hobby: 'Ֆուտբոլ', accent: '#bfdbfe' },
  { id: 8, name: 'Նարե Մկրտչյան', quote: 'Գեղեցիկը ստեղծում ենք մենք', hobby: 'Լուսանկարչություն', accent: '#fecdd3' },
  { id: 9, name: 'Գևորգ Հովհաննիսյան', quote: 'Գիտելիքը ուժ է', hobby: 'Շախմատ', accent: '#ddd6fe' },
  { id: 10, name: 'Անահիտ Կարապետյան', quote: 'Պահենք հիշողությունները հավերժ', hobby: 'Ճամփորդել', accent: '#bbf7d0' },
];

const eventDetails = [
  { icon: FaMapPin, label: 'Վայր', value: 'Տաշիրի շրջան, Գյուղ Լեռնահովիտ' },
  { icon: FaCalendar, label: 'Ամսաթիվ', value: 'Մայիսի 25, 2026' },
  { icon: FaClock, label: 'Ժամ', value: '10:00' },
  { icon: FaUsers, label: 'Դասղեկ', value: 'Հասմիկ Կավալյան' },
];

const timeline = [
  { time: '10:00', title: 'Բացման խոսք', text: 'Տոնական սկիզբ, ողջույնի խոսքեր և առաջին զանգի հիշողություն։' },
  { time: '10:25', title: 'Դասարանի ելույթ', text: 'Երաժշտություն, խոսք, պատմություններ և շնորհակալական պահեր։' },
  { time: '11:10', title: 'Լուսանկարահանում', text: 'Դասարան, ծնողներ, ուսուցիչներ և անմոռանալի կադրեր։' },
  { time: '11:40', title: 'Վերջին զանգ', text: 'Խորհրդանշական ավարտ և նոր ճանապարհի սկիզբ։' },
];

const floatingIcons = [FaStar, FaHeart, FaGift, FaMusic, FaCamera, FaTrophy];

function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; background: #070816; }
      .premium-page {
        min-height: 100vh;
        color: #fff;
        overflow-x: hidden;
        background:
          radial-gradient(circle at 15% 8%, rgba(248, 215, 122, .22), transparent 28rem),
          radial-gradient(circle at 85% 20%, rgba(122, 92, 255, .28), transparent 30rem),
          radial-gradient(circle at 50% 100%, rgba(55, 189, 255, .13), transparent 32rem),
          linear-gradient(135deg, #070816 0%, #11142b 48%, #070816 100%);
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .premium-container {
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        position: relative;
        z-index: 2;
      }
      .glass {
        background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.045));
        border: 1px solid rgba(255,255,255,.16);
        box-shadow: 0 24px 80px rgba(0,0,0,.32);
        backdrop-filter: blur(22px);
      }
      .gold-text {
        background: linear-gradient(135deg, #fff7d6 0%, #f8d77a 34%, #ffffff 62%, #b78d32 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .section-title { font-size: clamp(2rem, 4vw, 3.8rem); line-height: 1.02; margin: 0; letter-spacing: -0.05em; }
      .soft-text { color: rgba(255,255,255,.72); }
      .premium-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
      .student-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
      .two-column-section { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 24px; }
      .split-section { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .countdown-grid { display: grid; grid-template-columns: repeat(4, minmax(68px, 1fr)); gap: 12px; }
      .timeline-row { display: grid; grid-template-columns: 90px minmax(0, 1fr) auto; align-items: center; gap: 18px; }

      @media (max-width: 1100px) {
        .student-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }

      @media (max-width: 900px) {
        .premium-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .student-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .two-column-section,
        .split-section { grid-template-columns: 1fr; }
      }

      @media (max-width: 640px) {
        .premium-container { width: min(100% - 20px, 1180px); }
        .premium-grid,
        .student-grid { grid-template-columns: 1fr; }
        .hero-stats { grid-template-columns: 1fr; }
        .countdown-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .timeline-row { grid-template-columns: 1fr; gap: 10px; }
        .section-title { font-size: clamp(2rem, 12vw, 3rem); }
      }

      @media (max-width: 420px) {
        .premium-container { width: min(100% - 14px, 1180px); }
        .countdown-grid { gap: 8px; }
      }

      @media (hover: none) and (pointer: coarse) {
        .desktop-tilt { transform: none !important; }
      }
    `}</style>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-05-25T10:00:00');

    const tick = () => {
      const difference = Math.max(0, targetDate.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(difference / 86_400_000),
        hours: Math.floor((difference / 3_600_000) % 24),
        minutes: Math.floor((difference / 60_000) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const labels: Record<string, string> = {
    days: 'օր',
    hours: 'ժամ',
    minutes: 'րոպե',
    seconds: 'վրկ',
  };

  return (
    <div className="countdown-grid">
      {Object.entries(timeLeft).map(([unit, value], index) => (
        <motion.div
          key={unit}
          className="glass"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, type: 'spring', stiffness: 160, damping: 16 }}
          style={{ borderRadius: 24, padding: '20px 12px', textAlign: 'center' }}
        >
          <motion.div
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.06em' }}
          >
            {String(value).padStart(2, '0')}
          </motion.div>
          <div className="soft-text" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.18em' }}>{labels[unit]}</div>
        </motion.div>
      ))}
    </div>
  );
}

function PremiumHero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 24 });
  const rotateX = useTransform(smoothY, [-250, 250], [7, -7]);
  const rotateY = useTransform(smoothX, [-250, 250], [-7, 7]);

  return (
    <section
      onMouseMove={(event) => {
        if (window.matchMedia('(hover: none)').matches) return;
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left - rect.width / 2);
        mouseY.set(event.clientY - rect.top - rect.height / 2);
      }}
      style={{ minHeight: 'min(92vh, 920px)', display: 'grid', placeItems: 'center', padding: 'clamp(18px, 5vw, 48px) 0 24px', position: 'relative' }}
    >
      <motion.div
        className="desktop-tilt"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', width: '100%' }}
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="glass" style={{ borderRadius: 'clamp(26px, 5vw, 42px)', overflow: 'hidden', position: 'relative' }}>
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(120deg, rgba(248,215,122,.26), rgba(125,92,255,.18), rgba(66,194,255,.16), rgba(248,215,122,.22))',
              backgroundSize: '300% 300%',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,8,22,.1), rgba(7,8,22,.82))' }} />

          <div style={{ position: 'relative', padding: 'clamp(22px, 6vw, 82px)', minHeight: 'clamp(520px, 78vh, 680px)', display: 'grid', alignContent: 'space-between', gap: 'clamp(28px, 6vw, 48px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <motion.div className="glass" style={{ borderRadius: 999, padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }} whileHover={{ scale: 1.04 }}>
                <FaGraduationCap color="#f8d77a" />
                <span style={{ fontWeight: 800, letterSpacing: '.08em', fontSize: 13 }}>LAST BELL CEREMONY</span>
              </motion.div>
              <motion.div className="glass" style={{ borderRadius: 999, padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }} whileHover={{ scale: 1.04 }}>
                <FaCalendar color="#f8d77a" />
                <span style={{ fontWeight: 800, letterSpacing: '.08em', fontSize: 13 }}>25.05.2026</span>
              </motion.div>
            </div>

            <div style={{ maxWidth: 920 }}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="soft-text"
                style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: 18, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 800 }}
              >
                Շրջանավարտներ • Լեռնահովիտ • 2026
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="gold-text"
                style={{ fontSize: 'clamp(4rem, 13vw, 11rem)', lineHeight: 0.86, margin: 0, letterSpacing: '-0.09em', fontWeight: 700 }}
              >
                Վերջին<br />Զանգ
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{ maxWidth: 720, marginTop: 26, fontSize: 'clamp(1.05rem, 2vw, 1.45rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.82)' }}
              >
                Մեր ճանապարհորդության ավարտը, նոր սկիզբների արշալույսը։ Պահում ենք դպրոցական հիշողությունները և քայլում դեպի մեծ ապագա։
              </motion.p>
            </div>

            <div className="hero-stats">
              {[
                ['10', 'Շրջանավարտ'],
                ['12', 'Դասարան'],
              ].map(([number, label], index) => (
                <motion.div
                  key={label}
                  className="glass"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.72 + index * 0.08 }}
                  style={{ borderRadius: 28, padding: '20px 18px' }}
                >
                  <div className="gold-text" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 950, letterSpacing: '-0.08em' }}>{number}</div>
                  <div className="soft-text" style={{ fontWeight: 800 }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function DetailCard({ item, index }: { item: (typeof eventDetails)[number]; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      className="glass"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -8, scale: 1.02 }}
      style={{ borderRadius: 28, padding: 24, minHeight: 158 }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 18, display: 'grid', placeItems: 'center', background: 'rgba(248,215,122,.14)', marginBottom: 18 }}>
        <Icon color="#f8d77a" size={22} />
      </div>
      <div className="soft-text" style={{ fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8 }}>{item.label}</div>
      <div style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 800 }}>{item.value}</div>
    </motion.div>
  );
}

function StudentCard({ student, index }: { student: (typeof students)[number]; index: number }) {
  return (
    <motion.article
      className="glass"
      initial={{ opacity: 0, y: 34, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ delay: index * 0.045, type: 'spring', stiffness: 130, damping: 18 }}
      whileHover={{ y: -10, rotate: index % 2 === 0 ? -1 : 1 }}
      style={{ borderRadius: 30, padding: 18, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 'auto -30% -35% auto', width: 170, height: 170, borderRadius: '50%', background: student.accent, opacity: 0.16, filter: 'blur(18px)' }} />
      <div style={{ height: 210, borderRadius: 24, background: `linear-gradient(145deg, ${student.accent}, rgba(255,255,255,.08))`, display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }} transition={{ duration: 4, repeat: Infinity, delay: index * 0.18 }}>
          <FaGraduationCap size={72} color="rgba(7,8,22,.76)" />
        </motion.div>
        <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, padding: 12, borderRadius: 18, background: 'rgba(7,8,22,.42)', backdropFilter: 'blur(14px)' }}>
          <div style={{ fontWeight: 900 }}>{student.hobby}</div>
        </div>
      </div>
      <div style={{ padding: '18px 4px 4px' }}>
        <h3 style={{ margin: 0, fontSize: 19, letterSpacing: '-.02em' }}>{student.name}</h3>
        <p className="soft-text" style={{ margin: '10px 0 0', lineHeight: 1.55 }}>“{student.quote}”</p>
      </div>
    </motion.article>
  );
}

function Timeline() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {timeline.map((item, index) => (
        <motion.div
          key={item.time}
          className="glass timeline-row"
          initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          style={{ borderRadius: 28, padding: 22 }}
        >
          <div className="gold-text" style={{ fontSize: 26, fontWeight: 950 }}>{item.time}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{item.title}</div>
            <div className="soft-text" style={{ marginTop: 4, lineHeight: 1.5 }}>{item.text}</div>
          </div>
          <FaChevronRight color="rgba(248,215,122,.82)" />
        </motion.div>
      ))}
    </div>
  );
}

function App() {
  const [showRsvp, setShowRsvp] = useState(false);
  const particles = useMemo(() => floatingIcons.map((Icon, index) => ({ Icon, index, left: 8 + index * 15, top: 12 + ((index * 19) % 70) })), []);

  return (
    <div className="premium-page">
      <GlobalStyles />

      {particles.map(({ Icon, index, left, top }) => (
        <motion.div
          key={index}
          style={{ position: 'fixed', left: `${left}%`, top: `${top}%`, zIndex: 1, opacity: 0.1, pointerEvents: 'none' }}
          animate={{ y: [0, -34, 22, 0], x: [0, 18, -14, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 11 + index * 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={58} color="#f8d77a" />
        </motion.div>
      ))}

      <div className="premium-container">
        <PremiumHero />

        <section style={{ padding: 'clamp(28px, 5vw, 36px) 0 clamp(56px, 9vw, 90px)' }}>
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 26 }}>
            <div className="soft-text" style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12 }}>Event Details</div>
            <h2 className="section-title gold-text">Միջոցառման մանրամասներ</h2>
          </motion.div>
          <div className="premium-grid">
            {eventDetails.map((item, index) => <DetailCard key={item.label} item={item} index={index} />)}
          </div>
        </section>

        <section className="two-column-section" style={{ padding: '0 0 clamp(56px, 9vw, 90px)' }}>
          <motion.div className="glass" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: 34, padding: 'clamp(24px, 4vw, 42px)' }}>
            <div className="soft-text" style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12 }}>Countdown</div>
            <h2 className="section-title gold-text" style={{ marginBottom: 22 }}>Մնացել է</h2>
            <CountdownTimer />
          </motion.div>
          <motion.div className="glass" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: 34, padding: 'clamp(24px, 4vw, 42px)' }}>
            <GiPartyPopper size={42} color="#f8d77a" />
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.05, margin: '18px 0 14px', letterSpacing: '-.05em' }}>Մի օր, որը կմնա պատմության մեջ</h2>
            <p className="soft-text" style={{ fontSize: 18, lineHeight: 1.7, margin: 0 }}>Այս էջը ստեղծված է որպես հիշողությունների պրեմիում թվային հրավիրատոմս՝ տոնական, մաքուր և ժամանակակից ներկայացմամբ։</p>
          </motion.div>
        </section>

        <section style={{ padding: '0 0 clamp(56px, 9vw, 90px)' }}>
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 26, textAlign: 'center' }}>
            <div className="soft-text" style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12 }}>Our Class</div>
            <h2 className="section-title gold-text">Մեր դասարանը</h2>
          </motion.div>
          <div className="student-grid">
            {students.map((student, index) => <StudentCard key={student.id} student={student} index={index} />)}
          </div>
        </section>

        <section className="split-section" style={{ padding: '0 0 clamp(56px, 9vw, 90px)' }}>
          <motion.div className="glass" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: 34, padding: 'clamp(24px, 4vw, 42px)' }}>
            <div className="soft-text" style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12 }}>Program</div>
            <h2 className="section-title gold-text" style={{ marginBottom: 24 }}>Օրվա ծրագիրը</h2>
            <Timeline />
          </motion.div>
          <motion.div className="glass" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: 34, padding: 'clamp(24px, 4vw, 42px)', display: 'grid', alignContent: 'center' }}>
            <FaHeart color="#f8d77a" size={40} />
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4.7rem)', lineHeight: .95, margin: '20px 0', letterSpacing: '-.07em' }}>Սիրելի շրջանավարտներ</h2>
            <p className="soft-text" style={{ fontSize: 18, lineHeight: 1.8 }}>Այս օրը ձեր կյանքի նոր էջի սկիզբն է։ Պահեք ջերմ հիշողությունները, հպարտ եղեք ձեր անցած ճանապարհով և շարունակեք առաջ գնալ մեծ հավատով։</p>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowRsvp(true);
                window.setTimeout(() => setShowRsvp(false), 2600);
              }}
              style={{ marginTop: 24, border: 0, borderRadius: 999, padding: '16px 22px', color: '#080816', fontWeight: 950, fontSize: 16, cursor: 'pointer', background: 'linear-gradient(135deg, #fff7d6, #f8d77a, #c79a36)', boxShadow: '0 18px 40px rgba(248,215,122,.22)' }}
            >
              Հաստատել մասնակցությունը ✨
            </motion.button>
          </motion.div>
        </section>
      </div>

      <AnimatePresence>
        {showRsvp && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.94 }}
            style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 50, borderRadius: 24, padding: '16px 22px', background: 'linear-gradient(135deg, #fff7d6, #f8d77a)', color: '#090a18', fontWeight: 950, boxShadow: '0 18px 60px rgba(0,0,0,.42)' }}
          >
            Շնորհակալություն, սպասում ենք Ձեզ 🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
