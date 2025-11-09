import * as React from "react";
import { cn } from "@/lib/utils";

function ProviderButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-md border border-black/[.08] bg-white px-3 py-2 text-sm font-medium hover:bg-black/[.03] dark:border-white/[.145] dark:bg-black dark:hover:bg-[#111]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function GoogleButton({ redirectTo = "/api/auth/oauth?provider=google" }: { redirectTo?: string }) {
  return (
    <ProviderButton onClick={() => (window.location.href = redirectTo)}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.53,6.053,29.005,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.53,6.053,29.005,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c4.958,0,9.409-1.896,12.787-4.987l-5.895-4.982C29.862,35.411,27.088,36,24,36 c-5.202,0-9.619-3.315-11.274-7.952l-6.5,5.02C9.551,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.11,5.531c0.001-0.001,0.002-0.001,0.003-0.002 l6.491,5.002C36.564,39.704,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
      <span>Continue with Google</span>
    </ProviderButton>
  );
}

export function AppleButton({ redirectTo = "/api/auth/oauth?provider=apple" }: { redirectTo?: string }) {
  return (
    <ProviderButton onClick={() => (window.location.href = redirectTo)}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M16.365 1.43c0 1.14-.467 2.2-1.23 2.999-.789.828-2.092 1.467-3.164 1.387-.145-1.128.457-2.28 1.218-3.02.798-.77 2.18-1.33 3.176-1.366zM20.19 17.16c-.35.83-.512 1.2-.96 1.94-.623 1.02-1.503 2.29-2.598 2.3-1.01.01-1.276-.67-2.67-.66-1.393.01-1.675.67-2.687.66-1.095-.01-1.935-1.16-2.558-2.18-1.753-2.87-1.94-6.24-.856-8.03.768-1.25 1.983-2.01 3.348-2.01 1.247 0 2.032.68 3.063.68 1.006 0 1.62-.68 3.062-.68 1.104 0 2.27.6 3.035 1.64-2.667 1.45-2.236 5.22.82 6.34z"/></svg>
      <span>Continue with Apple</span>
    </ProviderButton>
  );
}

export function MicrosoftButton({ redirectTo = "/api/auth/oauth?provider=microsoft" }: { redirectTo?: string }) {
  return (
    <ProviderButton onClick={() => (window.location.href = redirectTo)}>
      <svg viewBox="0 0 23 23" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg"><path fill="#F35325" d="M1 1h10v10H1z"/><path fill="#81BC06" d="M12 1h10v10H12z"/><path fill="#05A6F0" d="M1 12h10v10H1z"/><path fill="#FFBA08" d="M12 12h10v10H12z"/></svg>
      <span>Continue with Microsoft</span>
    </ProviderButton>
  );
}
