// Sonner toast component - placeholder for Vite/React (not Next.js)
// We're using notistack for toasts instead

type ToasterProps = {
  theme?: "light" | "dark" | "system";
  className?: string;
  toastOptions?: any;
  [key: string]: any;
};

const Toaster = (_props: ToasterProps) => {
  // Placeholder - not used since we're using notistack
  return null;
};

// Placeholder toast function
const toast = {
  success: (message: string) => console.log("Toast:", message),
  error: (message: string) => console.error("Toast:", message),
  info: (message: string) => console.info("Toast:", message),
  warning: (message: string) => console.warn("Toast:", message),
};

export { Toaster, toast };
