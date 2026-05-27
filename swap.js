const fs = require('fs');
const content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const s1 = `      {/* Complimentary Invitation Announcement Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-t border-white/10 contain-layout">
        <div className="bg-slate-950/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden relative isolate shadow-[0_0_50px_rgba(99,102,241,0.05)] transform-gpu backface-visibility-hidden">
          
          {/* Ambient Atmosphere */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none -z-10" />
          
          {/* Subtle Glow Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[200px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
          
          <div className="relative z-10 px-6 py-16 md:px-12 md:py-20 text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white leading-tight mb-8">
              About Syllabus Pass Pricing
            </h3>
            {/* Main Narrative Paragraphs */}
            <p className="text-slate-300 font-sans leading-relaxed tracking-wide text-base md:text-lg max-w-4xl mx-auto mb-8">
              StudyAI Pro proudly unveils an exclusive complimentary invitation into our highest-tier elite intelligence ecosystem — a meticulously engineered academic mastery experience created for students destined for extraordinary achievement.
            </p>
            <p className="text-slate-300 font-sans leading-relaxed tracking-wide text-base md:text-lg max-w-4xl mx-auto mb-8">
              Beginning today, you receive unrestricted premier access to our complete generation suites, empowering you to think faster, learn deeper, create smarter, and perform at a level beyond conventional limits.
            </p>
            <p className="text-slate-300 font-sans leading-relaxed tracking-wide text-base md:text-lg max-w-4xl mx-auto mb-8">
              While these advanced capabilities will eventually evolve into our official Premium Syllabus Passes, we are honored to place their full power in your hands today — completely unlocked — as a distinguished advantage for your academic ascent.
            </p>
            
            {/* Impact Declaration Lines */}
            <div className="space-y-1 mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-medium tracking-wide text-sm md:text-base my-2 block">
                This is more than access.
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-medium tracking-wide text-sm md:text-base my-2 block">
                This is acceleration refined into excellence.
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-medium tracking-wide text-sm md:text-base my-2 block">
                A new standard of scholarly dominance.
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-medium tracking-wide text-sm md:text-base my-2 block">
                A gateway to precision, confidence, brilliance, and limitless potential.
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-medium tracking-wide text-sm md:text-base my-2 block">
                Explore without restriction.
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-medium tracking-wide text-sm md:text-base my-2 block">
                Master with elegance.
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-medium tracking-wide text-sm md:text-base my-2 block">
                Achieve with distinction.
              </span>
            </div>

            {/* Final Cinematic Declaration */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 font-extrabold text-lg md:text-2xl tracking-tight text-center block mt-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              Your extraordinary era of academic supremacy begins now with StudyAI Pro
            </span>
          </div>
        </div>
      </section>\n\n`;

const searchReplace1 = content.indexOf(s1);

if (searchReplace1 === -1) {
  console.log("Could not find complimentary section to remove.");
  process.exit(1);
}

const contentWithoutS1 = content.substring(0, searchReplace1) + content.substring(searchReplace1 + s1.length);

const targetText = '      {/* Frequently Asked Questions */}';
const targetIndex = contentWithoutS1.indexOf(targetText);

if (targetIndex === -1) {
  console.log("Could not find FAQ target.");
  process.exit(1);
}

const finalContent = contentWithoutS1.substring(0, targetIndex) + s1 + contentWithoutS1.substring(targetIndex);

fs.writeFileSync('src/components/LandingPage.tsx', finalContent, 'utf8');
console.log('Swapped successfully!');
