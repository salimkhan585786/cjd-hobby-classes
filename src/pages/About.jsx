import { motion } from 'framer-motion';
import { Award, Palette, Compass } from 'lucide-react';
import { FadeInView, ParallaxSection, StaggerContainer, StaggerItem, FloatingElement } from '../components/Animation';

function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-14">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <FadeInView direction="left">
          <div className="glass-card relative overflow-hidden rounded-[3rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft">
            <FloatingElement className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" duration={6} />
            <FloatingElement className="absolute -left-8 bottom-8 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl" duration={8} amplitude={12} />
            <p className="relative text-sm uppercase tracking-[0.24em] text-violet-300">About CJD HOBBY CLASSES</p>
            <h1 className="relative mt-4 text-5xl font-semibold text-white">A creative academy built for ambitious artists.</h1>
            <p className="relative mt-6 text-lg leading-8 text-slate-300">
              CJD HOBBY CLASSES by Hemali D. Mehta is a refined art school designed to help students of all ages master drawing, painting, calligraphy, handwriting, and creative thinking through structured courses, rich feedback, and a supportive learning community.
            </p>
            <StaggerContainer className="relative mt-10 grid gap-6 sm:grid-cols-2" staggerDelay={0.12}>
              {[
                { icon: Award, title: 'Skill-focused curriculum', text: 'Structured lessons that combine fundamentals with modern art practice.' },
                { icon: Compass, title: 'Personal mentorship', text: 'Guided support from professional instructors with creative direction.' },
                { icon: Palette, title: 'Portfolio building', text: 'Projects and showcases that help students grow with confidence.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <StaggerItem key={item.title}>
                    <motion.div
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="rounded-3xl bg-slate-900/80 p-6 shadow-soft"
                    >
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-200">
                        <Icon size={22} />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-slate-400">{item.text}</p>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </FadeInView>

        <div className="space-y-8">
          <FadeInView direction="right">
            <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Our mission</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">To make art learning accessible, premium, and deeply motivating.</h2>
              <p className="mt-4 text-slate-400">We blend expressive studio energy with modern digital workflows to build a complete creative experience for students and their families.</p>
            </div>
          </FadeInView>
          <div className="grid gap-6 sm:grid-cols-2">
            <FadeInView direction="right" delay={0.1}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
                className="rounded-[2.5rem] bg-gradient-to-br from-violet-500/15 to-sky-500/10 p-8 shadow-soft"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-violet-200">Our approach</p>
                <p className="mt-4 text-slate-100">Learning through projects, in-studio critique, and portfolio milestones built for every level.</p>
              </motion.div>
            </FadeInView>
            <FadeInView direction="right" delay={0.2}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
                className="rounded-[2.5rem] bg-gradient-to-br from-pink-500/15 to-orange-400/10 p-8 shadow-soft"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-pink-200">Community</p>
                <p className="mt-4 text-slate-100">A supportive studio culture where students celebrate progress and share artwork with confidence.</p>
              </motion.div>
            </FadeInView>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
