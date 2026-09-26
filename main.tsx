import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: { user?: { first_name?: string; username?: string; id?: number } };
      };
    };
  }
}

type Tab = "earn" | "miner" | "tasks" | "withdraw";

const tg = window.Telegram?.WebApp;

const initialTasks = [
  { id: 1, title: "Join our Telegram", reward: 0.1, done: false },
  { id: 2, title: "Follow our community", reward: 0.1, done: false },
  { id: 3, title: "Visit official channel", reward: 0.1, done: false },
  { id: 4, title: "Complete daily task", reward: 0.1, done: false },
];

function App() {
  const [tab, setTab] = useState<Tab>("earn");
  const [balance, setBalance] = useState(0.0341);
  const [pending, setPending] = useState(0.0000026);
  const [ppc, setPpc] = useState(10);
  const [tasks, setTasks] = useState(initialTasks);
  const [history, setHistory] = useState<string[]>([]);
  const [wallet, setWallet] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState("");
  const [mining, setMining] = useState(true);

  const user = tg?.initDataUnsafe?.user;
  const firstName = user?.first_name || "Miner";

  // Demo-only local mining. Real rewards must be calculated and validated server-side.
  useEffect(() => {
    tg?.ready();
    tg?.expand();
  }, []);

  useEffect(() => {
    if (!mining) return;
    const timer = window.setInterval(() => {
      setPending((v) => v + ppc * 0.000000001);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [ppc, mining]);

  const totalReferrals = 2;
  const referralLink = `https://t.me/Pepecoinminings_bot/app?startapp=${user?.id || "YOUR_ID"}`;

  const rate = useMemo(() => ppc * 0.000000001, [ppc]);

  const claim = () => {
    if (pending <= 0) return;
    setBalance((v) => v + pending);
    setHistory((h) => [`Claimed ${pending.toFixed(10)} PPC`, ...h].slice(0, 10));
    setPending(0);
    setMessage("Pending PPC claimed successfully.");
  };

  const completeTask = (id: number) => {
    setTasks((old) =>
      old.map((t) => (t.id === id ? { ...t, done: true } : t))
    );
    const task = tasks.find((t) => t.id === id);
    if (task && !task.done) {
      setPpc((v) => v + task.reward);
      setHistory((h) => [`Task reward +${task.reward} PPC`, ...h].slice(0, 10));
      setMessage(`+${task.reward} PPC added to mining power.`);
    }
  };

  const withdraw = () => {
    const amount = Number(withdrawAmount);
    if (!wallet.trim()) return setMessage("Enter your wallet address.");
    if (!amount || amount < 0.05) return setMessage("Minimum withdrawal is 0.0500 PPC.");
    if (amount > balance) return setMessage("Insufficient balance.");
    if (totalReferrals < 3) return setMessage("You need 3 valid referrals before withdrawal.");
    setBalance((v) => v - amount);
    setHistory((h) => [`Withdrawal requested: ${amount.toFixed(4)} PPC`, ...h].slice(0, 10));
    setWithdrawAmount("");
    setMessage("Withdrawal request created (demo mode).");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">PEPECOIN</div>
          <div className="sub">Mining Mini App</div>
        </div>
        <div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div>
      </header>

      <main className="content">
        {tab === "earn" && (
          <>
            <section className="hero">
              <div className="eyebrow">WELCOME, {firstName.toUpperCase()}</div>
              <h1>Earn PPC</h1>
              <p>Complete tasks, invite friends and build your PPC mining power.</p>
              <div className="balance-big">{balance.toFixed(4)} <span>PPC</span></div>
              <div className="mini-grid">
                <Stat label="PPC POWER" value={ppc.toFixed(1)} />
                <Stat label="REFERRALS" value={String(totalReferrals)} />
              </div>
            </section>

            <section className="card">
              <h2>Invite Friends</h2>
              <p className="muted">You and your friends can receive bonuses.</p>
              <div className="refbox">{referralLink}</div>
              <button onClick={() => navigator.clipboard?.writeText(referralLink)}>COPY REFERRAL LINK</button>
            </section>

            <section className="card">
              <h2>Quick Earn</h2>
              <div className="quick">
                <div><b>+0.1 PPC</b><span>Per completed task</span></div>
                <div><b>+3 PPC</b><span>Referral reward</span></div>
              </div>
            </section>
          </>
        )}

        {tab === "miner" && (
          <>
            <Title title="MINING DASHBOARD" />
            <section className="card center">
              <div className="label">TOTAL PPC POWER</div>
              <div className="power">{ppc.toFixed(1)} <span>PPC</span></div>
              <div className="rate">+{rate.toFixed(10)} PPC / second</div>
              <div className="row">
                <button onClick={() => setPpc((v) => v + 1)}>ADD PPC</button>
                <button className="outline" onClick={() => setPpc((v) => v + 0.5)}>FREE PPC</button>
              </div>
            </section>

            <section className="card center">
              <div className="label">YOUR BALANCE</div>
              <div className="balance">{balance.toFixed(4)} <span>PPC</span></div>
              <div className="label">PENDING BALANCE</div>
              <div className="pending">{pending.toFixed(10)} PPC</div>
              <button onClick={claim}>CLAIM BALANCE</button>
              <button className="outline" onClick={() => setMining((v) => !v)}>
                {mining ? "PAUSE MINING" : "START MINING"}
              </button>
            </section>

            <section className="card">
              <h2>History</h2>
              {history.length === 0 ? <p className="muted">No activity yet.</p> :
                history.map((x, i) => <div className="history" key={i}>{x}</div>)}
            </section>
          </>
        )}

        {tab === "tasks" && (
          <>
            <Title title="TASKS" />
            <section className="card">
              <button className="outline">PROMOTE YOUR LINK</button>
            </section>
            {tasks.map((task) => (
              <section className="task" key={task.id}>
                <div>
                  <b>{task.title}</b>
                  <span>+{task.reward} PPC</span>
                </div>
                <button disabled={task.done} onClick={() => completeTask(task.id)}>
                  {task.done ? "DONE" : `+${task.reward} PPC`}
                </button>
              </section>
            ))}
          </>
        )}

        {tab === "withdraw" && (
          <>
            <Title title="WITHDRAW" />
            <section className="card">
              <div className="label">YOUR BALANCE</div>
              <div className="balance">{balance.toFixed(4)} <span>PPC</span></div>
              <label>Wallet address</label>
              <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Enter your wallet address" />
              <label>Amount to withdraw</label>
              <input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} inputMode="decimal" placeholder="0.00" />
              <div className="hint">Minimum is 0.0500 PPC</div>
              <button onClick={withdraw}>WITHDRAW</button>
              <div className="warning">To withdraw you need 3 valid referrals ({totalReferrals} so far).</div>
            </section>
          </>
        )}

        {message && <div className="toast" onClick={() => setMessage("")}>{message}</div>}
      </main>

      <nav className="bottom">
        <NavButton active={tab === "earn"} onClick={() => setTab("earn")} icon="↗" text="EARN" />
        <NavButton active={tab === "miner"} onClick={() => setTab("miner")} icon="⛏" text="MINER" />
        <NavButton active={tab === "tasks"} onClick={() => setTab("tasks")} icon="▤" text="TASKS" />
        <NavButton active={tab === "withdraw"} onClick={() => setTab("withdraw")} icon="↔" text="WITHDRAW" />
      </nav>
    </div>
  );
}

function Title({ title }: { title: string }) {
  return <div className="page-title">{title}</div>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat"><span>{label}</span><b>{value}</b></div>;
}
function NavButton({ active, onClick, icon, text }: { active: boolean; onClick: () => void; icon: string; text: string }) {
  return <button className={`navbtn ${active ? "active" : ""}`} onClick={onClick}><span>{icon}</span><small>{text}</small></button>;
}

createRoot(document.getElementById("root")!).render(<App />);