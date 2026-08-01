import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-8 sm:py-12 md:py-16 lg:py-20 gap-6 md:gap-8 lg:gap-10 bg-neon-yellow overflow-hidden border-b-4 border-pure-black"
    >
      {/* Decorative Star */}
      <svg
        className="absolute top-4 left-4 w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-20 lg:h-20 text-pure-black"
        fill="currentColor"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
      </svg>

      {/* Decorative Squiggle */}
      <svg
        className="absolute bottom-6 right-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 text-neon-pink"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M10 50 Q 25 10 50 50 T 90 50" />
      </svg>

      {/* Left Content */}
      <div className="flex-1 z-10 flex flex-col items-center lg:items-start gap-4 md:gap-6 lg:gap-8 w-full min-w-0 max-w-full">
        <h1 className="font-headline text-[64px] sm:text-[72px] md:text-6xl lg:text-7xl xl:text-[96px] font-black uppercase tracking-tighter leading-[100%] z-10 w-full text-center lg:text-left break-words">
          HELLO, <br /> I AM{" "}
          <span className="bg-neon-blue px-2 md:px-4 text-pure-black inline-block -rotate-2">
            DANDI
          </span>
        </h1>

        {/* Computer Window - stacks below heading on mobile, beside on lg */}
        <div className="w-full lg:hidden flex justify-center">
          <ContactWindow />
        </div>

        <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl bg-white p-3 md:p-4 brutal-border brutal-shadow-sm hidden md:block">
          Building unapologetic digital experiences that break the mold and
          command attention. No boring grids allowed.
        </p>

        <div className="hidden md:flex gap-3 md:gap-4 flex-wrap justify-center lg:justify-start">
          <button className="bg-neon-pink text-white font-mono font-bold text-xs sm:text-sm md:text-base lg:text-xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 brutal-border brutal-shadow uppercase">
            Let&apos;s Talk
          </button>
          <button className="bg-white text-pure-black font-mono font-bold text-xs sm:text-sm md:text-base lg:text-xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 brutal-border brutal-shadow uppercase">
            View Work
          </button>
        </div>
      </div>

      {/* Right Content - Computer Window (desktop only) */}
      <div className="hidden lg:block flex-1 z-10 relative">
        <ContactWindow />
      </div>
    </section>
  );
}

function ContactWindow() {
  return (
    <div className="bg-white brutal-border brutal-shadow w-full max-w-xs sm:max-w-sm mx-auto mt-6 md:mt-0 rotate-[-2deg] md:rotate-0 lg:rotate-2 hover:rotate-0 transition-transform duration-300">
      <div className="computer-window-header">
        <div className="window-dot dot-red"></div>
        <div className="window-dot dot-yellow"></div>
        <div className="window-dot dot-green"></div>
        <span className="font-mono font-bold text-white text-xs ml-4">
          contact.exe
        </span>
      </div>
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center bg-surface-container-lowest gap-4 md:gap-6">
        <Image
          alt="Profile Picture"
          className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 brutal-border rounded-full object-cover brutal-shadow-sm"
          src="/images/profile.png"
          width={128}
          height={128}
          quality={100}
        />
        <div className="text-center">
          <h3 className="font-headline text-base sm:text-lg md:text-xl lg:text-2xl font-black uppercase mb-1 md:mb-2">
            Full Stack Web Developer &amp; System Administrator
          </h3>
          <a
            className="font-mono font-bold text-xs sm:text-sm md:text-base bg-neon-yellow px-3 md:px-4 py-1.5 md:py-2 brutal-border inline-block hover:bg-neon-blue hover:text-white transition-colors"
            href="mailto:dandiputraa31@gmail.com"
          >
            dandiputraa31@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
