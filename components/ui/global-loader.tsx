export function GlobalLoader() {
  return (
    <div className="flex items-center justify-center h-screen relative z-50">
      <div className="animate-pulse">
        <img src="/logo.svg" alt="Global Loader" width={215} height={48} />
      </div>
    </div>
  );
}
