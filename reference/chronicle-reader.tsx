import { useEffect, useRef, useState, useCallback } from "react";
import { X, BookOpen, ChevronUp, Volume2, VolumeX, Square, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CHRONICLE_SECTIONS } from "@/data/chronicle";

interface ChronicleReaderProps {
  open: boolean;
  onClose: () => void;
}

function useSpeech() {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [supported]);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1;
    utter.lang = "en-US";
    utter.onstart = () => { setIsReading(true); setIsPaused(false); };
    utter.onend = () => { setIsReading(false); setIsPaused(false); onDone?.(); };
    utter.onerror = () => { setIsReading(false); setIsPaused(false); };
    window.speechSynthesis.speak(utter);
  }, [supported]);

  useEffect(() => {
    return () => { if (supported) window.speechSynthesis.cancel(); };
  }, [supported]);

  return { supported, isReading, isPaused, speak, pause, resume, stop };
}

export function ChronicleReader({ open, onClose }: ChronicleReaderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(CHRONICLE_SECTIONS[0].id);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const { supported, isReading, isPaused, speak, pause, resume, stop } = useSpeech();

  const readCurrentSection = useCallback(() => {
    const section = CHRONICLE_SECTIONS.find((s) => s.id === activeSection);
    if (!section) return;
    const title = section.subheading ?? section.heading;
    const body = section.paragraphs.join(". ");
    speak(`${title}. ${body}`);
  }, [activeSection, speak]);

  const readFullBook = useCallback(() => {
    const chunks = CHRONICLE_SECTIONS.map((s) => {
      const title = s.subheading ?? s.heading;
      return `${title}. ${s.paragraphs.join(". ")}`;
    });
    let idx = 0;
    const playNext = () => {
      if (idx >= chunks.length) return;
      speak(chunks[idx], () => {
        idx++;
        playNext();
      });
    };
    playNext();
  }, [speak]);

  useEffect(() => {
    if (!open) stop();
  }, [open, stop]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      setShowScrollTop(el.scrollTop > 400);
      const sections = CHRONICLE_SECTIONS.map((s) => ({
        id: s.id,
        top: sectionRefs.current[s.id]?.offsetTop ?? 0,
      }));
      const scrollPos = el.scrollTop + 120;
      let current = sections[0].id;
      for (const s of sections) {
        if (scrollPos >= s.top) current = s.id;
      }
      setActiveSection(current);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [open]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setActiveSection(CHRONICLE_SECTIONS[0].id);
    }
  }, [open]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { stop(); onClose(); }
  };

  const isChapter = (id: string) => id.startsWith("chapter-");
  const isAppendix = (id: string) => id.startsWith("appendix-");

  const currentSectionLabel = CHRONICLE_SECTIONS.find((s) => s.id === activeSection)?.label ?? "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chronicle-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex overflow-hidden"
          onKeyDown={handleKey}
          tabIndex={-1}
        >
          {/* Sidebar TOC */}
          <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 border-r border-border/30 bg-background/60 py-8 px-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-8 px-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Contents</span>
            </div>
            <nav className="flex flex-col gap-1">
              {CHRONICLE_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`text-left px-2 py-2 min-h-11 text-xs font-mono tracking-wider uppercase transition-all duration-200 rounded-none border-l-2 ${
                    activeSection === s.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground/60 hover:text-muted-foreground hover:border-border"
                  } ${isAppendix(s.id) ? "text-[10px] opacity-70" : ""}`}
                >
                  {s.label}
                  {s.subheading && (
                    <span className="block text-[9px] normal-case tracking-normal mt-0.5 opacity-60">{s.subheading}</span>
                  )}
                </button>
              ))}
            </nav>

            {/* TTS sidebar controls */}
            {supported && (
              <div className="mt-auto pt-8 border-t border-border/20">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-mono mb-3 px-2">Listen</p>
                <div className="flex flex-col gap-2">
                  {!isReading ? (
                    <>
                      <button
                        onClick={readCurrentSection}
                        className="flex min-h-11 items-center gap-2 px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors text-left"
                      >
                        <Play className="w-3 h-3" />
                        This section
                      </button>
                      <button
                        onClick={readFullBook}
                        className="flex min-h-11 items-center gap-2 px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors text-left"
                      >
                        <Volume2 className="w-3 h-3" />
                        Full book
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 px-2 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-mono text-primary/70 uppercase tracking-widest truncate">
                          {isPaused ? "Paused" : "Reading..."}
                        </span>
                      </div>
                      <button
                        onClick={isPaused ? resume : pause}
                        className="flex min-h-11 items-center gap-2 px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors text-left"
                      >
                        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        {isPaused ? "Resume" : "Pause"}
                      </button>
                      <button
                        onClick={stop}
                        className="flex min-h-11 items-center gap-2 px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors text-left"
                      >
                        <Square className="w-3 h-3" />
                        Stop
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Main reader */}
          <div className="flex flex-col flex-1 min-w-0 h-full">
            {/* Header */}
            <header className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-6 md:px-10 min-h-16 border-b border-border/30 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-serif text-primary text-sm sm:text-lg tracking-wider sm:tracking-widest leading-tight min-w-0">THE POTIFY CHRONICLE</span>
                <span className="hidden sm:block text-muted-foreground/50 text-xs font-mono uppercase tracking-widest">— The First Cycle</span>
              </div>

              <div className="flex shrink-0 items-center gap-0 sm:gap-1">
                {/* Mobile TTS controls */}
                {supported && (
                  <div className="flex items-center gap-1 lg:hidden">
                    {!isReading ? (
                      <button
                        onClick={readCurrentSection}
                        title="Read current section aloud"
                        aria-label="Read current section aloud"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={isPaused ? resume : pause}
                          aria-label={isPaused ? "Resume reading" : "Pause reading"}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center text-primary"
                        >
                          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button onClick={stop} aria-label="Stop reading" className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                          <VolumeX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Reading indicator in header (mobile) */}
                {isReading && (
                  <span className="lg:hidden text-[9px] font-mono text-primary/60 uppercase tracking-widest hidden sm:block">
                    {isPaused ? "Paused" : "Reading"}
                  </span>
                )}

                <button
                  onClick={() => { stop(); onClose(); }}
                  aria-label="Close reader"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(74,158,90,0.25) transparent" }}
            >
              {/* Cover */}
              <div className="flex flex-col items-center justify-center py-24 px-6 border-b border-border/20 bg-gradient-to-b from-primary/5 to-transparent">
                <p className="text-muted-foreground/50 text-xs uppercase tracking-[0.3em] font-mono mb-6">Copyright © 2026</p>
                <h1 className="font-serif text-5xl md:text-7xl text-foreground text-center mb-4 drop-shadow-2xl">
                  THE POTIFY<br />CHRONICLE
                </h1>
                <div className="w-16 h-px bg-primary/50 my-6" />
                <p className="font-serif text-2xl md:text-3xl text-primary/80 text-center mb-2 italic">Book I — The First Cycle</p>
                <p className="text-muted-foreground/50 text-sm font-mono tracking-widest mt-4">Seed → Soil → Solana</p>

                {supported && (
                  <div className="mt-10 flex flex-col sm:flex-row gap-3">
                    {!isReading ? (
                      <>
                        <button
                          onClick={readFullBook}
                          className="flex min-h-11 items-center justify-center gap-2 px-6 py-2.5 border border-primary/40 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Listen to full book
                        </button>
                        <button
                          onClick={readCurrentSection}
                          className="flex min-h-11 items-center justify-center gap-2 px-6 py-2.5 border border-border/40 text-muted-foreground text-xs font-mono uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Current section only
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-3 min-w-0">
                        <span className="flex items-center gap-2 text-xs font-mono text-primary/70 uppercase tracking-widest break-words min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          {isPaused ? "Paused" : `Reading — ${currentSectionLabel}`}
                        </span>
                        <button
                          onClick={isPaused ? resume : pause}
                          className="flex min-h-11 items-center gap-2 px-4 py-2 border border-primary/40 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/10 transition-colors"
                        >
                          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                          {isPaused ? "Resume" : "Pause"}
                        </button>
                        <button
                          onClick={stop}
                          className="flex min-h-11 items-center gap-2 px-4 py-2 border border-border/40 text-muted-foreground text-xs font-mono uppercase tracking-widest hover:text-destructive hover:border-destructive/40 transition-colors"
                        >
                          <Square className="w-3 h-3" />
                          Stop
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sections */}
              <div className="max-w-2xl xl:max-w-3xl mx-auto px-6 md:px-10 py-16 space-y-20">
                {CHRONICLE_SECTIONS.map((section, idx) => (
                  <section
                    key={section.id}
                    ref={(el) => { sectionRefs.current[section.id] = el; }}
                    id={`reader-${section.id}`}
                  >
                    {/* Section heading */}
                    <div className="mb-10">
                      {isChapter(section.id) || isAppendix(section.id) ? (
                        <p className="text-muted-foreground/50 text-xs font-mono uppercase tracking-[0.3em] mb-3">
                          {isChapter(section.id) ? "Chapter" : "Appendix"}
                        </p>
                      ) : null}
                      <h2 className={`font-serif ${isAppendix(section.id) ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"} text-foreground mb-1`}>
                        {isChapter(section.id) ? section.subheading : section.heading}
                      </h2>
                      {section.subheading && !isChapter(section.id) && (
                        <p className="text-muted-foreground text-base font-light tracking-wide mt-1">{section.subheading}</p>
                      )}
                      {isChapter(section.id) && (
                        <p className="text-muted-foreground/50 text-sm font-mono tracking-widest mt-1">{section.heading}</p>
                      )}
                      <div className="w-12 h-px bg-primary/40 mt-6" />
                    </div>

                    {/* Paragraphs */}
                    <div className="space-y-4">
                      {section.paragraphs.map((p, i) => {
                        const isMotif = p === "Seed → Soil → Solana." || p === "Seed → Soil → Solana" || p === "Seed. Soil. Solana.";
                        const isPhaseLabel = section.id === "appendix-d" && /^Phase (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII) —/.test(p);
                        const isGroupLabel = section.id === "appendix-d" && p.startsWith("Phase Group");

                        if (isMotif) {
                          return (
                            <p key={i} className="font-mono text-primary/70 text-sm tracking-[0.2em] text-center py-4">
                              {p}
                            </p>
                          );
                        }
                        if (isPhaseLabel || isGroupLabel) {
                          return (
                            <p key={i} className="font-serif text-lg text-primary/80 mt-8 mb-1 font-medium">
                              {p}
                            </p>
                          );
                        }
                        return (
                          <p
                            key={i}
                            className="font-light text-foreground/85 leading-relaxed text-base md:text-lg"
                            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                          >
                            {p}
                          </p>
                        );
                      })}
                    </div>

                    {/* Section divider */}
                    {idx < CHRONICLE_SECTIONS.length - 1 && (
                      <div className="flex items-center gap-4 mt-16">
                        <div className="flex-1 h-px bg-border/20" />
                        <span className="text-muted-foreground/30 text-[10px] font-mono tracking-widest">— S.S.S —</span>
                        <div className="flex-1 h-px bg-border/20" />
                      </div>
                    )}
                  </section>
                ))}

                {/* End of volume */}
                <div className="flex flex-col items-center py-16 gap-4">
                  <div className="w-16 h-px bg-primary/30" />
                  <p className="font-serif text-xl text-muted-foreground/60 italic text-center">
                    End of The First Cycle
                  </p>
                  <p className="font-mono text-primary/50 text-xs tracking-[0.3em]">Seed → Soil → Solana</p>
                  <div className="w-16 h-px bg-primary/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll to top */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-top"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 z-[110] min-w-11 min-h-11 border border-primary/40 bg-background/80 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                aria-label="Back to top"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
