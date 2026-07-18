import { useProfile } from "./hooks/useProfile";
import { OnboardingFlow } from "./features/onboarding/OnboardingFlow";
import { AppRouter } from "./router";

export default function App() {
  const profile = useProfile();

  if (profile === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-slate-400">
        Loading…
      </div>
    );
  }

  if (profile === null) {
    return <OnboardingFlow />;
  }

  return <AppRouter />;
}
