import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "invoice_app_onboarded";

const steps = [
  {
    emoji: "👋",
    title: "Welcome to Invoice App",
    body: "Manage your invoices, track clients, and get paid — all in one place. Let's get you set up in 3 quick steps.",
    action: null,
  },
  {
    emoji: "👤",
    title: "Save your clients",
    body: "Add clients once and pick them from a dropdown whenever you create an invoice. No more retyping the same details.",
    action: { label: "Go to Clients", path: "/clients" },
  },
  {
    emoji: "📄",
    title: "Create your first invoice",
    body: "Fill in the line items, set a due date, and mark it as Sent. You can download a PDF and track payment status at any time.",
    action: { label: "Create Invoice", path: "/invoices/new" },
  },
  {
    emoji: "📊",
    title: "Track everything from the dashboard",
    body: "Your dashboard shows total revenue, outstanding amounts, and overdue alerts so nothing slips through the cracks.",
    action: { label: "View Dashboard", path: "/" },
  },
];

export function useOnboarding() {
  const [show, setShow] = useState(() => !localStorage.getItem(STORAGE_KEY));

  function complete() {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  }

  return { show, complete };
}

interface Props {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = steps[step];
  const isLast = step === steps.length - 1;

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleAction() {
    if (current.action) {
      navigate(current.action.path);
    }
    onClose();
  }

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-card">
        <button
          className="onboarding-skip"
          onClick={onClose}
          aria-label="Skip onboarding"
        >
          Skip
        </button>

        <div className="onboarding-emoji">{current.emoji}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-body">{current.body}</p>

        <div className="onboarding-dots">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot${i === step ? " active" : ""}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {current.action && (
            <button className="btn btn-secondary" onClick={handleAction}>
              {current.action.label}
            </button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {isLast ? "Get Started" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Run in your browser console to reset
localStorage.removeItem("invoice_app_onboarded");
