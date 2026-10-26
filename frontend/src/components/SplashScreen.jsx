import logo from "../assets/doccareernest-logo.png";
import { PageSkeleton } from "./Feedback.jsx";

export default function SplashScreen({ stage }) {
  if (stage === "skeleton") {
    return (
      <div className="min-h-screen bg-paper p-6">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="notebook-paper flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <div className="splash-ink mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-2xl border border-blue-200 bg-white shadow-sketch">
          <img src={logo} alt="DocCareerNest AI" className="h-24 w-24 rounded-xl object-cover" />
        </div>
        <h1 className="hand-title text-4xl font-semibold">DocCareerNest <span className="text-blueInk">AI</span></h1>
        <p className="mt-3 text-sm text-mutedInk">Organizing your career workspace...</p>
      </div>
    </div>
  );
}
