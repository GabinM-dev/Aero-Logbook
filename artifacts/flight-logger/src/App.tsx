import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import FlightsLog from "@/pages/flights/index";
import FlightForm from "@/pages/flights/form";
import Statistics from "@/pages/stats/index";
import ProfilePage from "@/pages/profile/index";
import LandingPage from "@/pages/landing";
import NotFound from "@/pages/not-found";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#FFB700",
    colorForeground: "#F5F9FF",
    colorMutedForeground: "#8FA3BE",
    colorDanger: "#DC2626",
    colorBackground: "#0D1526",
    colorInput: "#1B2B40",
    colorInputForeground: "#F5F9FF",
    colorNeutral: "#2A3F5A",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#101B2F] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl border border-[#1B2B40]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#F5F9FF] font-bold",
    headerSubtitle: "text-[#8FA3BE]",
    socialButtonsBlockButtonText: "text-[#F5F9FF]",
    formFieldLabel: "text-[#F5F9FF]",
    footerActionLink: "text-[#FFB700] hover:text-[#FFC933]",
    footerActionText: "text-[#8FA3BE]",
    dividerText: "text-[#8FA3BE]",
    identityPreviewEditButton: "text-[#FFB700]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-[#F5F9FF]",
    logoBox: "flex justify-center",
    logoImage: "h-10",
    socialButtonsBlockButton: "border border-[#2A3F5A] bg-[#1B2B40] hover:bg-[#243350]",
    formButtonPrimary: "bg-[#FFB700] text-[#0D1526] hover:bg-[#FFC933] font-semibold",
    formFieldInput: "bg-[#1B2B40] border-[#2A3F5A] text-[#F5F9FF]",
    footerAction: "bg-[#0D1526]",
    dividerLine: "bg-[#2A3F5A]",
    alert: "bg-[#1B2B40] border border-[#2A3F5A]",
    otpCodeFieldInput: "bg-[#1B2B40] border-[#2A3F5A] text-[#F5F9FF]",
    formFieldRow: "",
    main: "",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function AppRouter() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back, pilot",
            subtitle: "Sign in to access your flight logbook",
          },
        },
        signUp: {
          start: {
            title: "Start your logbook",
            subtitle: "Create an account to begin tracking your flights",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/flights" component={() => <ProtectedRoute component={FlightsLog} />} />
            <Route path="/flights/new" component={() => <ProtectedRoute component={FlightForm} />} />
            <Route path="/flights/:id/edit" component={() => <ProtectedRoute component={FlightForm} />} />
            <Route path="/stats" component={() => <ProtectedRoute component={Statistics} />} />
            <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRouter />
    </WouterRouter>
  );
}

export default App;
