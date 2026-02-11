import { useToastStore } from "@/stores/useToastStore";

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-md bg-gray-900/90 border border-gray-600 px-4 py-2 text-sm text-gray-200 shadow-lg animate-[fadeInOut_2.5s_ease-in-out]"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
