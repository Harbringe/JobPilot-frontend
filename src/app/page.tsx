"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  BarChart3,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  ChevronRight,
  MousePointer2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
} from "@/components/animated-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F7] via-[#FAFAFA] to-white" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#2997FF]/5 blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D1D1F]/5 text-sm text-[#1D1D1F] mb-8">
              <Sparkles className="w-4 h-4 text-[#2997FF]" />
              AI-Powered Job Applications
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.05] mb-8"
          >
            Apply to every job.
            <br />
            <span className="text-gradient">In one tap.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg sm:text-xl text-[#86868B] max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            JobPilot uses AI to tailor your resume for every job description,
            then applies automatically. More interviews. Less effort.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full px-8 h-14 text-base bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white shadow-lg shadow-black/10 group"
              >
                Start Free
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full px-8 h-14 text-base text-[#86868B] hover:text-[#1D1D1F]"
              >
                See how it works
              </Button>
            </Link>
          </motion.div>

          {/* Animated Stats & Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-24 max-w-5xl mx-auto"
          >
            {/* Animated rotating phrases */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-2xl sm:text-3xl md:text-4xl text-[#86868B] mb-16">
              <span>We help you</span>
              <motion.div className="relative h-10 sm:h-12 md:h-[52px] overflow-hidden w-[260px] sm:w-[340px] md:w-[420px]">
                <motion.div
                  animate={{ y: ["0%", "-25%", "-50%", "-75%", "0%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }}
                  className="flex flex-col"
                >
                  {["land dream jobs", "skip repetitive forms", "beat ATS filters", "save 100+ hours"].map((phrase) => (
                    <span key={phrase} className="h-10 sm:h-12 md:h-[52px] flex items-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2997FF] to-[#AF52DE]">
                      {phrase}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Trust signals bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14">
              {[
                { icon: <Zap className="w-6 h-6" />, text: "45-second apply", color: "#2997FF" },
                { icon: <Target className="w-6 h-6" />, text: "AI-matched resumes", color: "#34C759" },
                { icon: <TrendingUp className="w-6 h-6" />, text: "73% more interviews", color: "#AF52DE" },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="flex items-center gap-3 text-base sm:text-lg text-[#1D1D1F]"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="font-semibold">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Animated gradient line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 1.3, ease: "easeOut" }}
              className="mt-14 h-[2px] max-w-lg mx-auto bg-gradient-to-r from-transparent via-[#2997FF]/30 to-transparent origin-center"
            />

            {/* Subtle tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-8 text-base sm:text-lg text-[#86868B] text-center"
            >
              Trusted by <span className="text-[#1D1D1F] font-semibold">2,400+</span> job seekers • Free to get started
            </motion.p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-16 flex flex-col items-center gap-2 text-[#86868B]"
          >
            <MousePointer2 className="w-4 h-4 animate-bounce" />
            <span className="text-xs">Scroll to explore</span>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────── */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
              Everything you need.
              <br />
              <span className="text-[#86868B]">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-lg text-[#86868B] max-w-xl mx-auto">
              Three powerful features that transform your job search from overwhelming to effortless.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-7 h-7" />,
                title: "AI Resume Tailoring",
                description:
                  "Your resume, perfectly matched to every job description. Our AI highlights your most relevant experience automatically.",
                color: "#2997FF",
                bg: "#EBF5FF",
              },
              {
                icon: <MousePointer2 className="w-7 h-7" />,
                title: "One-Tap Apply",
                description:
                  "Found a job you like? One tap. We handle the rest — filling forms, attaching the right resume, and submitting.",
                color: "#34C759",
                bg: "#EDFDF2",
              },
              {
                icon: <BarChart3 className="w-7 h-7" />,
                title: "Application Tracker",
                description:
                  "Track every application from applied to offer. A beautiful dashboard that shows your entire pipeline at a glance.",
                color: "#AF52DE",
                bg: "#F6ECFD",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="group rounded-2xl border border-[#E8E8ED] bg-[#FAFAFA] p-8 hover:shadow-lg hover:shadow-black/5 transition-all duration-500 hover:-translate-y-1 h-full">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: feature.bg, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-[#86868B] leading-relaxed">{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────── */}
      <section id="how-it-works" className="py-32 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
              Three steps.
              <br />
              <span className="text-[#86868B]">That&apos;s it.</span>
            </h2>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-20">
            {[
              {
                step: "01",
                icon: <FileText className="w-6 h-6" />,
                title: "Build your profile once",
                description:
                  "Enter your experience, skills, and projects. Our smart form captures everything a recruiter needs to see. You'll never fill this out again.",
              },
              {
                step: "02",
                icon: <Target className="w-6 h-6" />,
                title: "Browse & apply instantly",
                description:
                  "AI matches your profile to thousands of jobs. See your match score for each role. When you find one you like — one tap, you're applied.",
              },
              {
                step: "03",
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Track & land interviews",
                description:
                  "Watch applications flow through your pipeline. See which companies are screening you, who wants to interview, and where offers land.",
              },
            ].map((item, i) => (
              <AnimatedSection
                key={item.step}
                delay={i * 0.15}
                className="flex gap-8 items-start"
              >
                <div className="hidden sm:flex flex-col items-center">
                  <span className="text-5xl font-bold text-[#E8E8ED]">{item.step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-lg text-[#86868B] leading-relaxed pl-[52px]">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────── */}
      <section className="py-32 bg-[#1D1D1F] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              The numbers speak.
            </h2>
            <p className="text-[#86868B] text-lg">
              JobPilot users get results faster.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, suffix: "+", label: "Jobs Applied" },
              { value: 73, suffix: "%", label: "More Interviews" },
              { value: 45, suffix: "s", label: "Avg. Apply Time" },
              { value: 4.9, suffix: "", label: "User Rating", isDecimal: true },
            ].map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold mb-2">
                  {stat.isDecimal ? (
                    <span>4.9</span>
                  ) : (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-sm text-[#86868B]">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── USP: Resume Tailoring ──────────────────────── */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2997FF]/10 text-[#2997FF] text-sm mb-6">
                <Zap className="w-3.5 h-3.5" />
                Our USP
              </div>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
                Your resume.
                <br />
                <span className="text-[#86868B]">Their job description.</span>
                <br />
                Perfect match.
              </h2>
              <p className="text-lg text-[#86868B] leading-relaxed mb-8">
                Traditional resumes are one-size-fits-all. But every job is different.
                Our AI rewrites your resume to highlight the exact skills and experience
                each employer is looking for — increasing your chance of getting through
                ATS filters and landing interviews by up to 73%.
              </p>
              <Link href="/register">
                <Button className="rounded-full px-8 h-12 bg-[#2997FF] hover:bg-[#2997FF]/90 text-white group">
                  Try it free
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl border border-[#E8E8ED] bg-[#F5F5F7] p-6">
                  <div className="flex items-center gap-2 text-xs text-[#86868B] mb-4">
                    <FileText className="w-3.5 h-3.5" />
                    AI-Tailored Resume Preview
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white p-4 border border-[#E8E8ED]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#2997FF]">HIGHLIGHTED</span>
                        <span className="text-xs text-[#34C759]">+92% relevance</span>
                      </div>
                      <div className="h-2 bg-[#F5F5F7] rounded-full mb-2">
                        <div className="h-full w-[92%] bg-gradient-to-r from-[#2997FF] to-[#5AC8FA] rounded-full" />
                      </div>
                      <p className="text-sm text-[#1D1D1F]">
                        &ldquo;Led development of <span className="bg-[#2997FF]/10 text-[#2997FF] px-1 rounded">React</span> and{" "}
                        <span className="bg-[#2997FF]/10 text-[#2997FF] px-1 rounded">TypeScript</span> applications
                        serving <span className="bg-[#2997FF]/10 text-[#2997FF] px-1 rounded">50K+ users</span>&rdquo;
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-[#E8E8ED]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#FF9500]">REWORDED</span>
                        <span className="text-xs text-[#34C759]">+67% relevance</span>
                      </div>
                      <p className="text-sm text-[#1D1D1F]">
                        &ldquo;Architected <span className="bg-[#FF9500]/10 text-[#FF9500] px-1 rounded">microservices</span> with{" "}
                        <span className="bg-[#FF9500]/10 text-[#FF9500] px-1 rounded">CI/CD pipelines</span>
                        reducing deployment time by 60%&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
                {/* Floating match score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-[#34C759] text-white flex flex-col items-center justify-center shadow-lg"
                >
                  <span className="text-2xl font-bold">92</span>
                  <span className="text-[10px] opacity-80">Match</span>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      <section className="py-32 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
              Your dream job is
              <br />
              one tap away.
            </h2>
            <p className="text-lg text-[#86868B] mb-10 max-w-xl mx-auto">
              Join thousands of job seekers who&apos;ve already streamlined their search.
              Free to get started. No credit card required.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-base bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white shadow-xl shadow-black/10 group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
