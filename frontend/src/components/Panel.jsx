export default function Panel({ children, className = "" }) {
  return (
    <section className={`doodle-border rounded-lg bg-paper/95 ${className}`}>
      {children}
    </section>
  );
}
