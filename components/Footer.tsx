const socials = [
  { name: "GitHub", href: "https://github.com/dandikurnia" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/dandiputraa" },
  { name: "Instagram", href: "https://www.instagram.com/dputrxx/" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 lg:gap-10 w-full px-4 sm:px-6 md:px-8 lg:px-16 py-10 sm:py-12 md:py-14 lg:py-16 bg-on-surface border-t-4 border-on-surface"
    >
      {/* Left: CTA */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 w-full lg:max-w-lg">
        <div className="font-headline text-5xl sm:text-6xl md:text-5xl lg:text-7xl xl:text-[96px] font-black text-primary-container leading-[100%] uppercase tracking-tighter">
          Let&apos;s Make <br /> Something <br />{" "}
          <span className="text-neon-pink">Loud.</span>
        </div>
        <p className="font-body text-surface text-sm sm:text-base md:text-lg lg:text-xl mt-1 sm:mt-2 md:mt-4">
          Available for freelance opportunities. Let&apos;s break some design
          rules together.
        </p>
        <a
          className="font-headline text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-black text-surface bg-pure-black border-4 border-surface inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 mt-2 sm:mt-4 w-max max-w-full hover:bg-neon-blue hover:text-pure-black hover:border-pure-black transition-all group"
          href="mailto:dandiputraa31@gmail.com"
        >
          <span className="truncate">dandiputraa31@gmail.com</span>
          <span className="material-symbols-outlined text-xl sm:text-2xl md:text-xl group-hover:translate-x-2 transition-transform shrink-0">
            arrow_forward
          </span>
        </a>

        {/* Copyright (Mobile only) */}
        <div className="font-mono font-bold text-surface text-xs sm:text-sm uppercase tracking-wider md:hidden mt-6">
          © 2026 Dandi Kurnia. All rights reserved.
        </div>
      </div>

      {/* Right: Copyright + Socials */}
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-12 mt-8 md:mt-0 w-full md:w-auto text-left md:text-right">
        {/* Copyright (Desktop only) */}
        <div className="font-mono font-bold text-surface text-xs sm:text-sm uppercase tracking-wider hidden md:block">
          © 2026 Dandi Kurnia. All rights reserved.
        </div>

        {/* Socials */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <h5 className="font-mono font-bold text-surface text-[10px] sm:text-xs uppercase tracking-widest opacity-50">
            Stalk Me
          </h5>
          <ul className="flex flex-col gap-1 sm:gap-2 font-headline text-lg sm:text-xl md:text-2xl lg:text-[32px] font-black leading-[120%]">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  className="text-surface hover:text-neon-pink transition-colors"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
