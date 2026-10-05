import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createElement } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Compass,
  GraduationCap,
  Layers3,
  Map,
  Sparkles,
  Target,
} from 'lucide-react';

const roles = [
  'software development',
  'data science',
  'product design',
  'product management',
  'cloud engineering',
  'full-stack development',
];

const homeStyles = `
  @keyframes home-enter {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes home-role-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes home-drift {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }
  .home-enter { animation: home-enter 650ms cubic-bezier(.2,.7,.2,1) both; }
  .home-delay-1 { animation-delay: 100ms; }
  .home-delay-2 { animation-delay: 190ms; }
  .home-delay-3 { animation-delay: 280ms; }
  .home-role-in { animation: home-role-in 350ms ease both; }
  .home-preview-drift { animation: home-drift 6s ease-in-out infinite; }
  .home-grid-pattern {
    background-image: linear-gradient(rgba(31, 87, 71, .055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(31, 87, 71, .055) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  @media (prefers-reduced-motion: reduce) {
    .home-enter, .home-role-in, .home-preview-drift { animation: none; }
  }
`;

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartJourney = () => {
    if (currentUser) {
      navigate('/quiz');
    } else {
      navigate('/login', { state: { returnTo: '/quiz' } });
    }
  };

  return (
    <main className="home-page overflow-hidden bg-[#f4f6f2] text-[#172923]">
      <style>{homeStyles}</style>

      <section className="relative">
        <div className="home-grid-pattern pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:py-24">
          <div className="home-enter">
            <div className="mb-7 inline-flex items-center gap-2 border-b border-[#1f5747]/25 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1f5747]">
              <Sparkles size={15} strokeWidth={2.2} />
              A more considered career plan
            </div>
            <h1 className="max-w-2xl text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#172923]">
              Make your next move
              <span className="block font-serif font-normal italic text-[#28725b]">with direction.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#58665f] sm:text-xl">
              Turn your strengths and interests into a practical plan for a career in tech.
            </p>
            <div className="mt-5 min-h-8 text-base text-[#58665f] sm:text-lg">
              Explore a path in{' '}
              <span key={currentRole} className="home-role-in inline-block font-semibold text-[#1f5747]">
                {roles[currentRole]}
              </span>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleStartJourney}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-[#1f5747] px-6 text-base font-semibold text-white shadow-[0_8px_24px_rgba(31,87,71,.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#174638] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f5747]"
              >
                {currentUser ? 'Build my roadmap' : 'Start with the career quiz'}
                <ArrowRight size={18} />
              </button>
              <a
                href="#approach"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md border border-[#cbd4ce] bg-white/60 px-6 text-base font-semibold text-[#263b32] transition hover:border-[#1f5747] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f5747]"
              >
                See how it works
                <ArrowDownRight size={17} />
              </a>
            </div>
            <p className="mt-5 text-sm text-[#718078]">
              {currentUser ? 'Your progress is saved to your account.' : 'Sign in to save your personalized roadmap.'}
            </p>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-[#d8dfda] pt-5">
              <div className="pr-3">
                <p className="text-2xl font-semibold tracking-tight text-[#172923]">8</p>
                <p className="mt-1 text-xs leading-5 text-[#718078] sm:text-sm">focused questions</p>
              </div>
              <div className="border-l border-[#d8dfda] px-4">
                <p className="text-2xl font-semibold tracking-tight text-[#172923]">3</p>
                <p className="mt-1 text-xs leading-5 text-[#718078] sm:text-sm">career matches</p>
              </div>
              <div className="border-l border-[#d8dfda] pl-4">
                <p className="text-2xl font-semibold tracking-tight text-[#172923]">6 months</p>
                <p className="mt-1 text-xs leading-5 text-[#718078] sm:text-sm">to map your progress</p>
              </div>
            </div>
          </div>

          <div className="home-enter home-delay-2 relative mx-auto w-full max-w-xl lg:pl-5">
            <div className="home-preview-drift relative overflow-hidden rounded-lg border border-[#dce4de] bg-white shadow-[0_28px_80px_rgba(28,56,43,.13)]">
              <div className="flex items-center justify-between border-b border-[#e7ece8] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e6f0e9] text-[#1f5747]">
                    <Compass size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#172923]">Your career direction</p>
                    <p className="mt-0.5 text-xs text-[#718078]">A plan shaped around you</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#edf4ee] px-3 py-1 text-xs font-semibold text-[#28725b]">Preview</span>
              </div>

              <div className="px-5 py-6 sm:px-7 sm:py-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#718078]">Suggested direction</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#172923] sm:text-3xl">Software Developer</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#718078]">A path that brings problem solving, creativity, and technical skills together.</p>
                  </div>
                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#dce4de] text-[#28725b] sm:flex">
                    <BriefcaseBusiness size={21} />
                  </div>
                </div>

                <div className="mt-7 border-y border-[#e7ece8] py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#263b32]">Your learning route</p>
                    <p className="text-xs font-medium text-[#718078]">6-month outline</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { month: '01—02', title: 'Foundations', icon: BookOpen },
                      { month: '03—04', title: 'Build skills', icon: Layers3 },
                      { month: '05—06', title: 'Show your work', icon: BarChart3 },
                    ].map(({ month, title, icon: StepIcon }, index) => (
                      <div key={month} className="relative min-w-0">
                        {index < 2 && <div className="absolute left-[calc(50%+15px)] right-[-8px] top-[17px] h-px bg-[#c8d9cc] sm:right-[-12px]" />}
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#c8d9cc] bg-white text-[#28725b]">
                          {createElement(StepIcon, { size: 16 })}
                        </div>
                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#8a9790] sm:text-xs">{month}</p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-[#263b32] sm:text-sm">{title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {['Skills to develop', 'Learning resources', 'Portfolio projects'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-sm bg-[#f3f6f3] px-2.5 py-1.5 text-[11px] font-medium text-[#53645a] sm:text-xs">
                      <Check size={13} className="text-[#28725b]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-md border border-[#dce4de] bg-white px-4 py-3 shadow-lg sm:flex lg:-left-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8efdc] text-[#8a6725]">
                <Target size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#263b32]">Built around your goals</p>
                <p className="mt-0.5 text-[11px] text-[#718078]">Clear steps, steady progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="approach" className="scroll-mt-20 border-y border-[#e2e8e3] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
          <div className="home-enter home-delay-1 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#28725b]">A practical process</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#172923] sm:text-4xl">From unsure to a plan you can use.</h2>
            <p className="mt-4 text-base leading-7 text-[#65736b]">Start with what you know about yourself. SkillMap turns that into a focused direction and manageable next steps.</p>
          </div>

          <div className="mt-12 grid gap-0 md:grid-cols-3">
            {[
              { number: '01', title: 'Understand your strengths', desc: 'Answer a short set of questions about your interests, skills, and working style.', icon: GraduationCap },
              { number: '02', title: 'Compare career paths', desc: 'Review career matches and see how each direction connects to your profile.', icon: Target },
              { number: '03', title: 'Move forward with a roadmap', desc: 'Follow a six-month outline with learning resources, projects, and milestones.', icon: Map },
            ].map(({ number, title, desc, icon: StepIcon }, index) => (
              <article key={number} className={`home-enter ${index === 0 ? 'home-delay-1' : index === 1 ? 'home-delay-2' : 'home-delay-3'} border-t border-[#dce4de] py-7 md:pr-8 ${index > 0 ? 'md:border-l md:pl-8' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.14em] text-[#8a9790]">{number}</span>
                  {createElement(StepIcon, { size: 19, strokeWidth: 1.8, className: 'text-[#28725b]' })}
                </div>
                <h3 className="mt-7 text-xl font-semibold tracking-tight text-[#172923]">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#65736b]">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className="home-enter">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#28725b]">More than a job title</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#172923] sm:text-4xl">A useful next step, not just another list.</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#65736b]">See what to learn, what to build, and how to track your progress as your goals take shape.</p>
          <button
            onClick={handleStartJourney}
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#1f5747] transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f5747]"
          >
            {currentUser ? 'Continue to your quiz' : 'Find your career direction'}
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="grid content-start sm:grid-cols-2">
          {[
            { title: 'Career matches', desc: 'Explore three directions aligned to your interests and skills.' },
            { title: 'Learning resources', desc: 'Find focused courses, books, and tutorials for each stage.' },
            { title: 'Portfolio projects', desc: 'Practice with projects designed to demonstrate your growing skills.' },
            { title: 'Progress tracking', desc: 'Keep milestones and recommendations together in your dashboard.' },
          ].map((item, index) => (
            <div key={item.title} className={`home-enter ${index % 2 === 0 ? 'home-delay-1' : 'home-delay-2'} border-t border-[#dce4de] py-5 sm:px-5 ${index % 2 === 0 ? 'sm:pl-0' : 'sm:border-l'}`}>
              <h3 className="text-base font-semibold text-[#263b32]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#718078]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#1d493d] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between md:py-16">
          <div className="home-enter max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9d5c3]">Your next step starts here</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Make a career plan that feels like yours.</h2>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">Take the quiz and get a clear place to begin.</p>
          </div>
          <button
            onClick={handleStartJourney}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-md bg-[#e3c77c] px-6 text-base font-semibold text-[#1b3027] transition hover:-translate-y-0.5 hover:bg-[#edd997] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {currentUser ? 'Build my roadmap' : 'Start the career quiz'}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}