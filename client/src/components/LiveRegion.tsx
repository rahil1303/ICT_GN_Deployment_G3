export default function LiveRegion() {
  return (
    <>
      {/* ARIA Live Regions for Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only" 
        id="polite-announcements"
        role="status"
      />
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only" 
        id="urgent-announcements"
        role="alert"
      />
    </>
  );
}
