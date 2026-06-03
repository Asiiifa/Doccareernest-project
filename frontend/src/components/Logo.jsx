import logo from "../assets/doccareernest-logo.png";

export default function Logo({ compact = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img src={logo} alt="DocCareerNest AI" className="h-9 w-9 rounded-md object-cover" />
      {!compact && (
        <div className="min-w-0">
          <div className="hand-title truncate text-lg font-semibold leading-tight">
            DocCareerNest <span className="text-blueInk">AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
