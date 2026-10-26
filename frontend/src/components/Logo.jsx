import logo from "../assets/doccareernest-logo.png";

export default function Logo({ compact = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img src={logo} alt="DocCareerNest AI" className="h-10 w-10 shrink-0 rounded-md object-cover" />
      {!compact && (
        <div className="min-w-0 flex-1">
          <div className="hand-title whitespace-nowrap text-xl font-semibold leading-tight">
            DocCareerNest <span className="text-blueInk">AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
