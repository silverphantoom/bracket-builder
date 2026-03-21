import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BracketCreator } from "@/components/bracket/BracketCreator";
import { ToastProvider } from "@/components/ui/toast";
import { Trophy, Share2, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="px-4 pt-16 pb-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Make anything a{" "}
              <span className="text-accent-primary">tournament.</span>
            </h1>
            <p className="mt-4 mx-auto max-w-md text-lg text-text-secondary">
              Create a bracket, share a link, watch the votes pour in. No login
              required.
            </p>
          </section>

          {/* Bracket Creator */}
          <section id="create" className="px-4 pb-16">
            <BracketCreator />
          </section>

          {/* How it works */}
          <section className="border-t border-border-default bg-bg-surface px-4 py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-10 text-center text-2xl font-bold">
                How it works
              </h2>
              <div className="grid gap-8 sm:grid-cols-3">
                {[
                  {
                    icon: Trophy,
                    title: "1. Add entries",
                    desc: "Name your bracket and add 3-32 entries. Drag to set seeding.",
                  },
                  {
                    icon: Share2,
                    title: "2. Share the link",
                    desc: "Get a unique URL. Send it to friends, post it anywhere.",
                  },
                  {
                    icon: BarChart3,
                    title: "3. Watch votes roll in",
                    desc: "Results update live. Winners advance. Champion crowned.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary/10">
                      <Icon size={24} className="text-accent-primary" />
                    </div>
                    <h3 className="mb-1 font-bold">{title}</h3>
                    <p className="text-sm text-text-secondary">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ToastProvider>
  );
}
