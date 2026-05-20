import { useEffect, useMemo, useState } from "react";
import {
	motion,
	AnimatePresence,
	useMotionValue,
	useSpring,
	useTransform,
	useScroll,
	useReducedMotion,
	type Variants,
} from "framer-motion";
import { Formik, Form, Field } from "formik";
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
	FaHandSparkles,
	FaArrowUp,
} from "react-icons/fa6";
import { GiPartyPopper } from "react-icons/gi";

const API_URL =
	import.meta.env.REACT_APP_API_URL || "https://graduate-9sim.vercel.app";

type RegisterValues = {
	firstName: string;
	lastName: string;
	phone: string;
	guests: string;
	note: string;
};

type CurrentUser = {
	id: string;
	firstName: string;
	lastName: string;
	phone: string;
	guests: string;
	status: "pending" | "approved" | "rejected";
	role: "member" | "admin";
};

async function apiRequest<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || "Server request failed");
	}

	return data as T;
}

async function registerMember(values: RegisterValues) {
	return apiRequest<{
		success: boolean;
		message: string;
		token: string;
		currentUser: CurrentUser;
		websiteClosed: boolean;
	}>("/api/members/register", {
		method: "POST",
		body: JSON.stringify(values),
	});
}

async function getCurrentUser() {
	try {
		return await apiRequest<{
			success: boolean;
			currentUser: CurrentUser;
			websiteClosed: boolean;
		}>("/api/auth/me");
	} catch {
		return null;
	}
}

async function trackVisit() {
	try {
		await apiRequest("/api/visits", {
			method: "POST",
			body: JSON.stringify({
				page: window.location.pathname,
				title: document.title,
				screen: {
					width: window.screen.width,
					height: window.screen.height,
				},
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			}),
		});
	} catch {
		// Analytics must never break the UI.
	}
}

const students = [
	{
		id: 1,
		name: "Էրիկ Անտոնյան",
		quote: "Միշտ առաջ՝ վստահ քայլերով",
		hobby: "Սպորտ",
		accent: "#f8d77a",
		pic: "/students/antonyan.png",
	},
	{
		id: 2,
		name: "Միլենա Դալալոյան",
		quote: "Երազանքը սկսվում է հավատից",
		hobby: "Նկարչություն",
		accent: "#e7b9ff",
    pic: "/students/dalaloyan.png",
	},
	{
		id: 3,
		name: "Աննա Քարամյան",
		quote: "Յուրաքանչյուր ավարտ նոր սկիզբ է",
		hobby: "Տեխնոլոգիա",
		accent: "#8ee7ff",
    pic: "/students/qaramyan.png",
	},
	{
		id: 4,
		name: "Լուսինե Օհանջանյան",
		quote: "Լույսը տանենք մեզ հետ",
		hobby: "Երաժշտություն",
		accent: "#ffb2c6",
    pic: "/students/ohanjanyan.png",
	},
	{
		id: 5,
		name: "Էլենա Հակոբյան",
		quote: "Հաղթանակը ծնվում է աշխատանքից",
		hobby: "Կարդալ",
		accent: "#a7f3d0",
    pic: "/students/hakobyan.png",
	},
	{
		id: 6,
		name: "Անդրանիկ Հովեյան",
		quote: "Սիրտ, կամք, ապագա",
		hobby: "Պար",
		accent: "#fde68a",
    pic: "/students/hoveyan.png",
	},
	{
		id: 7,
		name: "Միլենա Գրիգորյան",
		quote: "Մեր պատմությունը շարունակվում է",
		hobby: "Ֆուտբոլ",
		accent: "#bfdbfe",
    pic: "/students/grigoryan.png",
	},
	{
		id: 8,
		name: "Անատոլի Պողոսյան",
		quote: "Գեղեցիկը ստեղծում ենք մենք",
		hobby: "Լուսանկարչություն",
		accent: "#fecdd3",
		pic: "/students/poghosyan.png",
	},
	{
		id: 9,
		name: "Վիկտորյա Նազարյան",
		quote: "Գիտելիքը ուժ է",
		hobby: "Շախմատ",
		accent: "#ddd6fe",
    pic: "/students/nazaryan.png",
	},
	{
		id: 10,
		name: "Մաքսիմ Մինասյան",
		quote: "Պահենք հիշողությունները հավերժ",
		hobby: "Ճամփորդել",
		accent: "#bbf7d0",
    pic: "/students/minasyan.png",
	},
];

const eventDetails = [
	{ icon: FaMapPin, label: "Վայր", value: "Լեռնահովիտի Ս․ Կարապետյանի անվան միջնակարգ դպրոց" },
	{ icon: FaCalendar, label: "Ամսաթիվ", value: "Մայիսի 25, 2026" },
	{ icon: FaClock, label: "Ժամ", value: "10:00" },
	{ icon: FaUsers, label: "Դասղեկ", value: "Հասմիկ Կավալյան" },
];

// const timeline = [
// 	{
// 		time: "10:00",
// 		title: "Բացման խոսք",
// 		text: "Տոնական սկիզբ, ողջույնի խոսքեր և առաջին զանգի հիշողություն։",
// 	},
// 	{
// 		time: "10:25",
// 		title: "Դասարանի ելույթ",
// 		text: "Երաժշտություն, խոսք, պատմություններ և շնորհակալական պահեր։",
// 	},
// 	{
// 		time: "11:10",
// 		title: "Լուսանկարահանում",
// 		text: "Դասարան, ծնողներ, ուսուցիչներ և անմոռանալի կադրեր։",
// 	},
// 	{
// 		time: "11:40",
// 		title: "Վերջին զանգ",
// 		text: "Խորհրդանշական ավարտ և նոր ճանապարհի սկիզբ։",
// 	},
// ];

const floatingIcons = [
	FaStar,
	FaHeart,
	FaGift,
	FaMusic,
	FaCamera,
	FaTrophy,
	FaHandSparkles,
];

const pageEnter: Variants = {
	hidden: { opacity: 0, y: 28, filter: "blur(14px)" },
	visible: (delay = 0) => ({
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { delay, duration: 0.85, ease: [0.16, 1, 0.3, 1] },
	}),
};

const premiumPop: Variants = {
	hidden: {
		opacity: 0,
		y: 34,
		scale: 0.92,
		rotateX: -12,
		filter: "blur(14px)",
	},
	visible: (delay = 0) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		rotateX: 0,
		filter: "blur(0px)",
		transition: {
			delay,
			type: "spring" as const,
			stiffness: 120,
			damping: 18,
			mass: 0.8,
		},
	}),
};

const inputStyle: React.CSSProperties = {
	width: "100%",
	border: "1px solid rgba(255,255,255,.16)",
	outline: "none",
	borderRadius: 18,
	padding: "14px 15px",
	color: "#fff",
	background: "rgba(255,255,255,.09)",
	boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
};

const labelStyle: React.CSSProperties = {
	fontSize: 13,
	fontWeight: 900,
	letterSpacing: ".08em",
	color: "rgba(255,255,255,.78)",
};

const errorStyle: React.CSSProperties = {
	color: "#ffb2c6",
	fontSize: 12,
	fontWeight: 800,
};

function GlobalStyles() {
	return (
		<style>{`
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; background: #050613; }
      button, input, textarea, select { font: inherit; }
      .premium-page {
        min-height: 100vh;
        color: #fff;
        overflow-x: hidden;
        background:
          radial-gradient(circle at 12% 8%, rgba(248, 215, 122, .24), transparent 30rem),
          radial-gradient(circle at 85% 16%, rgba(122, 92, 255, .34), transparent 34rem),
          radial-gradient(circle at 50% 105%, rgba(55, 189, 255, .17), transparent 36rem),
          linear-gradient(135deg, #050613 0%, #11142b 48%, #050613 100%);
        font-family: Inter, Montserrat, Arian AMU, Noto Sans Armenian, system-ui, sans-serif;
        position: relative;
      }
      .premium-page:before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
        background-size: 72px 72px;
        mask-image: radial-gradient(circle at center, black, transparent 74%);
      }
      .premium-container {
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        position: relative;
        z-index: 2;
      }
      .glass {
        background: linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.045));
        border: 1px solid rgba(255,255,255,.18);
        box-shadow: 0 28px 90px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.12);
        backdrop-filter: blur(24px) saturate(138%);
      }
      .gold-text {
        background: linear-gradient(135deg, #fff9df 0%, #f8d77a 28%, #ffffff 56%, #c79a36 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .section-title { font-size: clamp(2rem, 4vw, 3.8rem); margin: 0; letter-spacing: -0.05em; }
      .soft-text { color: rgba(255,255,255,.72); }
      .premium-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
      .student-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
      .two-column-section { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 24px; }
      .split-section { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
      .countdown-grid { display: grid; grid-template-columns: repeat(4, minmax(68px, 1fr)); gap: 12px; }
      .timeline-row { display: grid; grid-template-columns: 90px minmax(0, 1fr) auto; align-items: center; gap: 18px; }
      .premium-button {
        border: 0;
        border-radius: 999px;
        padding: 16px 22px;
        color: #080816;
        font-weight: 950;
        font-size: 16px;
        cursor: pointer;
        background: linear-gradient(135deg, #fff7d6, #f8d77a, #c79a36);
        box-shadow: 0 18px 40px rgba(248,215,122,.24), inset 0 1px 0 rgba(255,255,255,.72);
        position: relative;
        overflow: hidden;
      }
      .premium-button:disabled { cursor: not-allowed; opacity: .65; }
      @media (max-width: 1100px) { .student-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      @media (max-width: 900px) {
        .premium-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .student-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .two-column-section, .split-section { grid-template-columns: 1fr; }
      }
      @media (max-width: 640px) {
        .premium-container { width: min(100% - 20px, 1180px); }
        .premium-grid, .student-grid { grid-template-columns: 1fr; }
        .hero-stats { grid-template-columns: 1fr; }
        .countdown-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .timeline-row { grid-template-columns: 1fr; gap: 10px; }
      }
    `}</style>
	);
}

function AnimatedGradientOrbs() {
	return (
		<div
			aria-hidden
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 0,
				overflow: "hidden",
				pointerEvents: "none",
			}}
		>
			{[
				{
					size: 420,
					left: "-6%",
					top: "10%",
					delay: 0,
					color: "rgba(248,215,122,.22)",
				},
				{
					size: 520,
					left: "72%",
					top: "8%",
					delay: 1.2,
					color: "rgba(122,92,255,.25)",
				},
				{
					size: 460,
					left: "34%",
					top: "72%",
					delay: 2.1,
					color: "rgba(66,194,255,.13)",
				},
			].map((orb, index) => (
				<motion.div
					key={index}
					animate={{
						x: [0, 40, -24, 0],
						y: [0, -36, 28, 0],
						scale: [1, 1.12, 0.96, 1],
					}}
					transition={{
						duration: 14 + index * 3,
						repeat: Infinity,
						ease: "easeInOut",
						delay: orb.delay,
					}}
					style={{
						position: "absolute",
						width: orb.size,
						height: orb.size,
						left: orb.left,
						top: orb.top,
						borderRadius: "50%",
						background: orb.color,
						filter: "blur(44px)",
					}}
				/>
			))}
		</div>
	);
}

function ScrollProgress() {
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
	return (
		<motion.div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				height: 4,
				scaleX,
				transformOrigin: "0% 50%",
				zIndex: 100,
				background: "linear-gradient(90deg, #fff7d6, #f8d77a, #8ee7ff)",
				boxShadow: "0 0 24px rgba(248,215,122,.7)",
			}}
		/>
	);
}

function CountdownTimer() {
	const [timeLeft, setTimeLeft] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		const targetDate = new Date("2026-05-25T10:00:00");
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
		days: "օր",
		hours: "ժամ",
		minutes: "րոպե",
		seconds: "վրկ",
	};

	return (
		<div className="countdown-grid">
			{Object.entries(timeLeft).map(([unit, value], index) => (
				<motion.div
					key={unit}
					className="glass"
					variants={premiumPop}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					custom={index * 0.07}
					whileHover={{ y: -8, scale: 1.04 }}
					style={{
						borderRadius: 24,
						padding: "20px 12px",
						textAlign: "center",
					}}
				>
					<AnimatePresence mode="popLayout">
						<motion.div
							key={value}
							initial={{ y: -20, opacity: 0, scale: 0.75 }}
							animate={{ y: 0, opacity: 1, scale: 1 }}
							exit={{ y: 20, opacity: 0, scale: 0.75 }}
							transition={{
								type: "spring",
								stiffness: 260,
								damping: 20,
							}}
							style={{
								fontSize: "clamp(1.6rem, 4vw, 3rem)",
								fontWeight: 950,
								letterSpacing: "-0.06em",
							}}
						>
							{String(value).padStart(2, "0")}
						</motion.div>
					</AnimatePresence>
					<div
						className="soft-text"
						style={{
							fontSize: 13,
							textTransform: "uppercase",
							letterSpacing: ".18em",
						}}
					>
						{labels[unit]}
					</div>
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
	const reducedMotion = useReducedMotion();

	return (
		<section
			onMouseMove={(event) => {
				if (window.matchMedia("(hover: none)").matches) return;
				const rect = event.currentTarget.getBoundingClientRect();
				mouseX.set(event.clientX - rect.left - rect.width / 2);
				mouseY.set(event.clientY - rect.top - rect.height / 2);
			}}
			style={{
				minHeight: "min(92vh, 920px)",
				display: "grid",
				placeItems: "center",
				padding: "clamp(18px, 5vw, 48px) 0 24px",
				position: "relative",
			}}
		>
			<motion.div
				className="desktop-tilt"
				style={{
					rotateX: reducedMotion ? 0 : rotateX,
					rotateY: reducedMotion ? 0 : rotateY,
					transformStyle: "preserve-3d",
					width: "100%",
				}}
				initial={{
					opacity: 0,
					y: 54,
					scale: 0.95,
					filter: "blur(18px)",
				}}
				animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
				transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
			>
				<div
					className="glass"
					style={{
						borderRadius: "clamp(26px, 5vw, 42px)",
						overflow: "hidden",
						position: "relative",
					}}
				>
					<motion.div
						animate={{
							backgroundPosition: [
								"0% 50%",
								"100% 50%",
								"0% 50%",
							],
						}}
						transition={{
							duration: 12,
							repeat: Infinity,
							ease: "linear",
						}}
						style={{
							position: "absolute",
							inset: 0,
							background:
								"linear-gradient(120deg, rgba(248,215,122,.30), rgba(125,92,255,.24), rgba(66,194,255,.19), rgba(255,178,198,.16), rgba(248,215,122,.24))",
							backgroundSize: "360% 360%",
						}}
					/>
					<div
						style={{
							position: "absolute",
							inset: 0,
							background:
								"linear-gradient(180deg, rgba(7,8,22,.06), rgba(7,8,22,.84))",
						}}
					/>

					<div
						style={{
							position: "relative",
							padding: "clamp(22px, 6vw, 82px)",
							minHeight: "clamp(520px, 78vh, 690px)",
							display: "grid",
							alignContent: "space-between",
							gap: "clamp(28px, 6vw, 48px)",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								gap: 16,
								flexWrap: "wrap",
							}}
						>
							<motion.div
								className="glass"
								variants={pageEnter}
								initial="hidden"
								animate="visible"
								custom={0.14}
								whileHover={{ scale: 1.05, y: -3 }}
								style={{
									borderRadius: 999,
									padding: "10px 16px",
									display: "flex",
									gap: 10,
									alignItems: "center",
								}}
							>
								<FaGraduationCap color="#f8d77a" />
								<span
									style={{
										fontWeight: 900,
										letterSpacing: ".08em",
										fontSize: 13,
									}}
								>
									LAST BELL CEREMONY
								</span>
							</motion.div>
							<motion.div
								className="glass"
								variants={pageEnter}
								initial="hidden"
								animate="visible"
								custom={0.22}
								whileHover={{ scale: 1.05, y: -3 }}
								style={{
									borderRadius: 999,
									padding: "10px 16px",
									display: "flex",
									gap: 10,
									alignItems: "center",
								}}
							>
								<FaCalendar color="#f8d77a" />
								<span
									style={{
										fontWeight: 900,
										letterSpacing: ".08em",
										fontSize: 13,
									}}
								>
									25.05.2026
								</span>
							</motion.div>
						</div>

						<div style={{ maxWidth: 930 }}>
							<motion.div
								variants={pageEnter}
								initial="hidden"
								animate="visible"
								custom={0.25}
								className="soft-text"
								style={{
									fontSize: "clamp(1rem, 2vw, 1.25rem)",
									marginBottom: 18,
									letterSpacing: ".18em",
									textTransform: "uppercase",
									fontWeight: 900,
								}}
							>
								Շրջանավարտներ • Լեռնահովիտ • 2026
							</motion.div>
							<motion.h1
								initial={{
									opacity: 0,
									y: 36,
									scale: 0.94,
									filter: "blur(18px)",
								}}
								animate={{
									opacity: 1,
									y: 0,
									scale: 1,
									filter: "blur(0px)",
								}}
								transition={{
									delay: 0.34,
									duration: 1,
									ease: [0.16, 1, 0.3, 1],
								}}
								className="gold-text"
								style={{
									fontSize: "clamp(4rem, 13vw, 11rem)",
									lineHeight: 0.86,
									margin: 0,
									letterSpacing: "-0.09em",
									fontWeight: 900,
								}}
							>
								Վերջին
								<br />
								Զանգ
							</motion.h1>
							<motion.p
								variants={pageEnter}
								initial="hidden"
								animate="visible"
								custom={0.58}
								style={{
									maxWidth: 720,
									marginTop: 26,
									fontSize: "clamp(1.05rem, 2vw, 1.45rem)",
									lineHeight: 1.7,
									color: "rgba(255,255,255,.84)",
								}}
							>
								Մեր ճանապարհորդության ավարտը, նոր սկիզբների
								արշալույսը։ Պահում ենք դպրոցական
								հիշողությունները և քայլում դեպի մեծ ապագա։
							</motion.p>
						</div>

						<div className="hero-stats">
							{[
								["10", "Շրջանավարտ"],
								["12", "Դասարան"],
								["∞", "Հիշողություն"],
							].map(([number, label], index) => (
								<motion.div
									key={label}
									className="glass"
									variants={premiumPop}
									initial="hidden"
									animate="visible"
									custom={0.7 + index * 0.09}
									whileHover={{ y: -8, scale: 1.03 }}
									style={{
										borderRadius: 28,
										padding: "20px 18px",
									}}
								>
									<div
										className="gold-text"
										style={{
											fontSize: "clamp(2rem, 6vw, 4rem)",
											fontWeight: 950,
											letterSpacing: "-0.08em",
										}}
									>
										{number}
									</div>
									<div
										className="soft-text"
										style={{ fontWeight: 900 }}
									>
										{label}
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</motion.div>
		</section>
	);
}

function DetailCard({
	item,
	index,
}: {
	item: (typeof eventDetails)[number];
	index: number;
}) {
	const Icon = item.icon;
	return (
		<motion.div
			className="glass"
			variants={premiumPop}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-80px" }}
			custom={index * 0.08}
			whileHover={{ y: -10, scale: 1.025 }}
			style={{ borderRadius: 28, padding: 24, minHeight: 158 }}
		>
			<motion.div
				animate={{ rotate: [0, 8, -5, 0], scale: [1, 1.08, 1] }}
				transition={{
					duration: 5,
					repeat: Infinity,
					delay: index * 0.3,
				}}
				style={{
					width: 52,
					height: 52,
					borderRadius: 18,
					display: "grid",
					placeItems: "center",
					background: "rgba(248,215,122,.14)",
					marginBottom: 18,
				}}
			>
				<Icon color="#f8d77a" size={22} />
			</motion.div>
			<div
				className="soft-text"
				style={{
					fontSize: 13,
					letterSpacing: ".14em",
					textTransform: "uppercase",
					marginBottom: 8,
				}}
			>
				{item.label}
			</div>
			<div style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 900 }}>
				{item.value}
			</div>
		</motion.div>
	);
}

function StudentCard({
	student,
	index,
}: {
	student: (typeof students)[number];
	index: number;
}) {
	return (
		<motion.article
			className="glass"
			variants={premiumPop}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-70px" }}
			custom={index * 0.045}
			whileHover={{
				y: -12,
				rotate: index % 2 === 0 ? -1.2 : 1.2,
				scale: 1.02,
			}}
			style={{
				borderRadius: 30,
				padding: 18,
				position: "relative",
				overflow: "hidden",
			}}
		>
			<motion.div
				animate={{ scale: [1, 1.2, 1], opacity: [0.14, 0.28, 0.14] }}
				transition={{
					duration: 4.5,
					repeat: Infinity,
					delay: index * 0.18,
				}}
				style={{
					position: "absolute",
					inset: "auto -30% -35% auto",
					width: 180,
					height: 180,
					borderRadius: "50%",
					background: student.accent,
					filter: "blur(20px)",
				}}
			/>
			<div
				style={{
					height: 210,
					borderRadius: 24,
					display: "grid",
					placeItems: "center",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<motion.img
          style={{width: "100%", height: "100%", objectFit: "cover"}}
					src={student.pic}
					alt=""
				/>
			</div>
			<div style={{ padding: "18px 4px 4px" }}>
				<h3
					style={{ margin: 0, fontSize: 19, letterSpacing: "-.02em" }}
				>
					{student.name}
				</h3>
			</div>
		</motion.article>
	);
}

// function Timeline() {
// 	return (
// 		<div style={{ display: "grid", gap: 14 }}>
// 			{timeline.map((item, index) => (
// 				<motion.div
// 					key={item.time}
// 					className="glass timeline-row"
// 					variants={premiumPop}
// 					initial="hidden"
// 					whileInView="visible"
// 					viewport={{ once: true }}
// 					custom={index * 0.08}
// 					whileHover={{ x: 6, scale: 1.012 }}
// 					style={{ borderRadius: 28, padding: 22 }}
// 				>
// 					<div
// 						className="gold-text"
// 						style={{ fontSize: 26, fontWeight: 950 }}
// 					>
// 						{item.time}
// 					</div>
// 					<div>
// 						<div style={{ fontWeight: 950, fontSize: 18 }}>
// 							{item.title}
// 						</div>
// 						<div
// 							className="soft-text"
// 							style={{ marginTop: 4, lineHeight: 1.5 }}
// 						>
// 							{item.text}
// 						</div>
// 					</div>
// 					<motion.div
// 						animate={{ x: [0, 5, 0] }}
// 						transition={{
// 							duration: 1.4,
// 							repeat: Infinity,
// 							delay: index * 0.15,
// 						}}
// 					>
// 						<FaChevronRight color="rgba(248,215,122,.82)" />
// 					</motion.div>
// 				</motion.div>
// 			))}
// 		</div>
// 	);
// }

function RsvpPopup({
	onClose,
	onRegistered,
}: {
	onClose: () => void;
	onRegistered: (user: CurrentUser) => void;
}) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0, transition: { duration: 0.28 } }}
			onClick={onClose}
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 80,
				display: "grid",
				placeItems: "center",
				padding: 18,
				background: "rgba(3,4,14,.68)",
				backdropFilter: "blur(18px)",
			}}
		>
			<Formik
				initialValues={{
					firstName: "",
					lastName: "",
					phone: "",
					guests: "1",
					note: "",
				}}
				validate={(values) => {
					const errors: Partial<
						Record<keyof RegisterValues, string>
					> = {};
					if (!values.firstName.trim())
						errors.firstName = "Անունը պարտադիր է";
					if (!values.lastName.trim())
						errors.lastName = "Ազգանունը պարտադիր է";
					if (!values.phone.trim())
						errors.phone = "Հեռախոսահամարը պարտադիր է";
					return errors;
				}}
				onSubmit={async (values, helpers) => {
					try {
						const data = await registerMember(values);
						onRegistered(data.currentUser);
						helpers.resetForm();
						onClose();
					} catch (error) {
						helpers.setStatus(
							error instanceof Error
								? error.message
								: "Registration failed",
						);
					} finally {
						helpers.setSubmitting(false);
					}
				}}
			>
				{({ errors, touched, status, isSubmitting }) => (
					<motion.div
						onClick={(event) => event.stopPropagation()}
						initial={{
							opacity: 0,
							y: 70,
							scale: 0.88,
							rotateX: -16,
							filter: "blur(18px)",
						}}
						animate={{
							opacity: 1,
							y: 0,
							scale: 1,
							rotateX: 0,
							filter: "blur(0px)",
						}}
						exit={{
							opacity: 0,
							y: 70,
							scale: 0.86,
							rotateX: 16,
							filter: "blur(18px)",
							transition: {
								duration: 0.42,
								ease: [0.7, 0, 0.84, 0],
							},
						}}
						transition={{
							type: "spring",
							stiffness: 155,
							damping: 18,
						}}
						className="glass"
						style={{
							width: "min(560px, 100%)",
							borderRadius: 34,
							padding: "clamp(22px, 5vw, 34px)",
							position: "relative",
							overflow: "hidden",
						}}
					>
						<Form style={{ position: "relative" }}>
							<button
								type="button"
								onClick={onClose}
								style={{
									position: "absolute",
									right: 0,
									top: 0,
									width: 40,
									height: 40,
									borderRadius: 14,
									border: "1px solid rgba(255,255,255,.16)",
									background: "rgba(255,255,255,.1)",
									color: "#fff",
									cursor: "pointer",
									fontWeight: 900,
								}}
							>
								×
							</button>

							<motion.div
								animate={{
									rotate: [0, 7, -5, 0],
									scale: [1, 1.08, 1],
								}}
								transition={{ duration: 3, repeat: Infinity }}
								style={{
									width: 58,
									height: 58,
									borderRadius: 20,
									display: "grid",
									placeItems: "center",
									background: "rgba(248,215,122,.15)",
									marginBottom: 18,
								}}
							>
								<GiPartyPopper size={28} color="#f8d77a" />
							</motion.div>

							<h2
								className="gold-text"
								style={{
									margin: 0,
									fontSize: "clamp(2rem, 6vw, 3.4rem)",
									letterSpacing: "-.06em",
									fontWeight: 950,
								}}
							>
								Մասնակցության հաստատում
							</h2>
							<p
								className="soft-text"
								style={{
									margin: "12px 0 24px",
								}}
							>
								Լրացրեք տվյալները, որպեսզի հաստատենք Ձեր
								մասնակցությունը միջոցառմանը։
							</p>

							<div
								style={{
									display: "grid",
									gridTemplateColumns:
										"repeat(2, minmax(0, 1fr))",
									gap: 12,
								}}
							>
								<label style={{ display: "grid", gap: 8 }}>
									<span style={labelStyle}>Անուն</span>
									<Field
										name="firstName"
										placeholder="Օր․ Արամ"
										style={inputStyle}
									/>
									{touched.firstName && errors.firstName && (
										<span style={errorStyle}>
											{errors.firstName}
										</span>
									)}
								</label>
								<label style={{ display: "grid", gap: 8 }}>
									<span style={labelStyle}>Ազգանուն</span>
									<Field
										name="lastName"
										placeholder="Օր․ Հովհաննիսյան"
										style={inputStyle}
									/>
									{touched.lastName && errors.lastName && (
										<span style={errorStyle}>
											{errors.lastName}
										</span>
									)}
								</label>
							</div>

							<label
								style={{
									display: "grid",
									gap: 8,
									marginTop: 12,
								}}
							>
								<span style={labelStyle}>Հեռախոսահամար</span>
								<Field
									name="phone"
									type="tel"
									placeholder="+374 __ __ __ __"
									style={inputStyle}
								/>
								{touched.phone && errors.phone && (
									<span style={errorStyle}>
										{errors.phone}
									</span>
								)}
							</label>

							<label
								style={{
									display: "grid",
									gap: 8,
									marginTop: 12,
								}}
							>
								<span style={labelStyle}>Հյուրերի քանակ</span>
								<Field
									as="select"
									name="guests"
									style={inputStyle}
								>
									<option value="1">1 անձ</option>
									<option value="2">2 անձ</option>
									<option value="3">3 անձ</option>
									<option value="4">4 անձ</option>
									<option value="5+">5+ անձ</option>
								</Field>
							</label>

							<label
								style={{
									display: "grid",
									gap: 8,
									marginTop: 12,
								}}
							>
								<span style={labelStyle}>Նշում</span>
								<Field
									as="textarea"
									name="note"
									placeholder="Ցանկության դեպքում գրեք լրացուցիչ նշում..."
									rows={3}
									style={{
										...inputStyle,
										resize: "vertical",
									}}
								/>
							</label>

							{status && (
								<div
									style={{
										color: "#ffb2c6",
										fontWeight: 900,
										marginTop: 12,
									}}
								>
									{status}
								</div>
							)}

							<motion.button
								type="submit"
								disabled={isSubmitting}
								whileHover={{
									scale: isSubmitting ? 1 : 1.025,
									y: isSubmitting ? 0 : -2,
								}}
								whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
								className="premium-button"
								style={{ width: "100%", marginTop: 18 }}
							>
								{isSubmitting
									? "Ուղարկվում է..."
									: "Ուղարկել հաստատումը"}
							</motion.button>
						</Form>
					</motion.div>
				)}
			</Formik>
		</motion.div>
	);
}

function Landing() {
	const [showRsvp, setShowRsvp] = useState(false);
	const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
	const [websiteClosed, setWebsiteClosed] = useState(false);
	const particles = useMemo(
		() =>
			floatingIcons.map((Icon, index) => ({
				Icon,
				index,
				left: 6 + index * 13,
				top: 10 + ((index * 17) % 74),
			})),
		[],
	);

	useEffect(() => {
		trackVisit();

		getCurrentUser().then((data) => {
			if (!data) return;
			setCurrentUser(data.currentUser);
			setWebsiteClosed(data.websiteClosed);
		});
	}, []);

	return (
		<div className="premium-page">
			<GlobalStyles />
			<AnimatedGradientOrbs />
			<ScrollProgress />

			{particles.map(({ Icon, index, left, top }) => (
				<motion.div
					key={index}
					style={{
						position: "fixed",
						left: `${left}%`,
						top: `${top}%`,
						zIndex: 1,
						opacity: 0.11,
						pointerEvents: "none",
					}}
					animate={{
						y: [0, -38, 24, 0],
						x: [0, 20, -16, 0],
						rotate: [0, 180, 360],
						scale: [1, 1.16, 0.92, 1],
					}}
					transition={{
						duration: 11 + index * 1.35,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					<Icon size={58} color="#f8d77a" />
				</motion.div>
			))}

			<div className="premium-container">
				{websiteClosed && (
					<motion.div
						className="glass"
						initial={{ opacity: 0, y: -18 }}
						animate={{ opacity: 1, y: 0 }}
						style={{
							marginTop: 18,
							borderRadius: 24,
							padding: 18,
							color: "#ffdfdf",
							fontWeight: 900,
							textAlign: "center",
						}}
					>
						Կայքը փակված է միջոցառումից հետո։
					</motion.div>
				)}

				{currentUser && (
					<motion.div
						className="glass"
						initial={{ opacity: 0, y: -18 }}
						animate={{ opacity: 1, y: 0 }}
						style={{
							marginTop: 18,
							borderRadius: 24,
							padding: 18,
							color: "#fff",
							fontWeight: 900,
							textAlign: "center",
						}}
					>
						Դուք արդեն գրանցված եք՝ {currentUser.firstName}{" "}
						{currentUser.lastName} • կարգավիճակ՝{" "}
						{currentUser.status}
					</motion.div>
				)}

				<PremiumHero />

				<section
					style={{
						padding:
							"clamp(28px, 5vw, 36px) 0 clamp(56px, 9vw, 90px)",
					}}
				>
					<motion.div
						variants={pageEnter}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						style={{ marginBottom: 26 }}
					>
						<div
							className="soft-text"
							style={{
								letterSpacing: ".18em",
								textTransform: "uppercase",
								fontWeight: 950,
								marginBottom: 12,
							}}
						>
							Event Details
						</div>
						<h2 className="section-title gold-text">
							Միջոցառման մանրամասներ
						</h2>
					</motion.div>
					<div className="premium-grid">
						{eventDetails.map((item, index) => (
							<DetailCard
								key={item.label}
								item={item}
								index={index}
							/>
						))}
					</div>
				</section>

				<section
					className="two-column-section"
					style={{ padding: "0 0 clamp(56px, 9vw, 90px)" }}
				>
					<motion.div
						className="glass"
						variants={premiumPop}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						style={{
							borderRadius: 34,
							padding: "clamp(24px, 4vw, 42px)",
						}}
					>
						<div
							className="soft-text"
							style={{
								letterSpacing: ".18em",
								textTransform: "uppercase",
								fontWeight: 950,
								marginBottom: 12,
							}}
						>
							Countdown
						</div>
						<h2
							className="section-title gold-text"
							style={{ marginBottom: 22 }}
						>
							Մնացել է
						</h2>
						<CountdownTimer />
					</motion.div>
					<motion.div
						className="glass"
						variants={premiumPop}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						custom={0.12}
						whileHover={{ y: -8, scale: 1.01 }}
						style={{
							borderRadius: 34,
							padding: "clamp(24px, 4vw, 42px)",
						}}
					>
						<GiPartyPopper size={42} color="#f8d77a" />
						<h2
							style={{
								fontSize: "clamp(1.8rem, 4vw, 3rem)",
								margin: "18px 0 14px",
								letterSpacing: "-.05em",
							}}
						>
							Մի օր, որը կմնա պատմության մեջ
						</h2>
						<p
							className="soft-text"
							style={{ fontSize: 18, margin: 0 }}
						>
							Այս էջը ստեղծված է որպես հիշողությունների պրեմիում
							թվային հրավիրատոմս՝ տոնական, մաքուր և ժամանակակից
							ներկայացմամբ։
						</p>
					</motion.div>
				</section>

				<section style={{ padding: "0 0 clamp(56px, 9vw, 90px)" }}>
					<motion.div
						variants={pageEnter}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						style={{ marginBottom: 26, textAlign: "center" }}
					>
						<div
							className="soft-text"
							style={{
								letterSpacing: ".18em",
								textTransform: "uppercase",
								fontWeight: 950,
								marginBottom: 12,
							}}
						>
							Our Class
						</div>
						<h2 className="section-title gold-text">
							Մեր դասարանը
						</h2>
					</motion.div>
					<div className="student-grid">
						{students.map((student, index) => (
							<StudentCard
								key={student.id}
								student={student}
								index={index}
							/>
						))}
					</div>
				</section>

				<section
					className="split-section"
					style={{ padding: "0 0 clamp(56px, 9vw, 90px)" }}
				>
					<motion.div
						className="glass"
						variants={premiumPop}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						custom={0.14}
						whileHover={{ y: -8, scale: 1.01 }}
						style={{
							borderRadius: 34,
							padding: "clamp(24px, 4vw, 42px)",
							display: "grid",
							alignContent: "center",
						}}
					>
						<FaHeart color="#f8d77a" size={40} />
						<h2
							style={{
								fontSize: "clamp(2rem, 2vw, 4.7rem)",
								margin: "20px 0",
								letterSpacing: "-.07em",
							}}
						>
							Սիրելի շրջանավարտներ
						</h2>
						<p
							className="soft-text"
							style={{ fontSize: 18 }}
						>
							Այս օրը ձեր կյանքի նոր էջի սկիզբն է։ Պահեք ջերմ
							հիշողությունները, հպարտ եղեք ձեր անցած ճանապարհով և
							շարունակեք առաջ գնալ մեծ հավատով։
						</p>
						{/* <motion.button
							whileHover={{
								scale: websiteClosed ? 1 : 1.035,
								y: websiteClosed ? 0 : -3,
							}}
							whileTap={{ scale: websiteClosed ? 1 : 0.96 }}
							className="premium-button"
							onClick={() => {
								if (!websiteClosed) setShowRsvp(true);
							}}
							disabled={websiteClosed}
							style={{ marginTop: 24, width: "100%" }}
						>
							{websiteClosed
								? "Գրանցումը փակ է"
								: currentUser
									? "Թարմացնել մասնակցությունը"
									: "Հաստատել մասնակցությունը"}
						</motion.button> */}
					</motion.div>
				</section>
			</div>

			<motion.button
				aria-label="Scroll to top"
				onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ y: -4, scale: 1.06 }}
				whileTap={{ scale: 0.94 }}
				style={{
					position: "fixed",
					right: 18,
					bottom: 18,
					zIndex: 40,
					width: 48,
					height: 48,
					borderRadius: 16,
					border: "1px solid rgba(255,255,255,.18)",
					background: "rgba(255,255,255,.12)",
					color: "#f8d77a",
					backdropFilter: "blur(18px)",
					cursor: "pointer",
					boxShadow: "0 18px 48px rgba(0,0,0,.32)",
				}}
			>
				<FaArrowUp />
			</motion.button>

			<AnimatePresence mode="wait">
				{showRsvp && (
					<RsvpPopup
						key="rsvp-popup"
						onClose={() => setShowRsvp(false)}
						onRegistered={(user) => setCurrentUser(user)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

export default Landing;
