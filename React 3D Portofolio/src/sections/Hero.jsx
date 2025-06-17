import { words } from "../../constants/index.js";
import AnimatedCounter from "../components/AnimatedCounter.jsx";
import Button from "../components/Button.jsx";
import useModelStore from "../store/appStore.js";
import HeroExperiences from "../components/HeroModels/HeroExperience.jsx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Hero = () => {
  const modelLoaded = useModelStore((state) => state.modelLoaded);

  useGSAP(() => {
    if (!modelLoaded) return;
    gsap.fromTo(".hero-text h1, p, .gsap-animate",
      // from
      {
        y: 50, opacity: 0
      },
      // to
      {
        y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: "power2.inOut"
      }
    );
  }, [modelLoaded]);
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-0 left-0 z-10">
        <img src="/images/bg.png" alt="background" />
      </div>

      <div className="hero-layout select-none">
        {/* LEFT: HERO CONTENT */}
        <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5">
          {modelLoaded && (
            <div className="flex flex-col gap-7">
              <div className="hero-text">
                <h1>Shaping
                  <span className="slide">
                    <span className="wrapper">
                      {words.map((word, index) => (
                        <span key={`${word.text}-${index}`} className="flex items-center md:gap-3 gap-1 pb-2">
                          <img src={word.imgPath} alt={word.text} className="xl:size-12 md:size-10 size-7 md:p-2 p-1 rounded-full bg-white-50" />
                          <span>{word.text}</span>
                        </span>
                      ))}
                    </span>
                  </span>
                </h1>
                <h1>into Real Projects</h1>
                <h1>that Deliver Results</h1>
              </div>
              <p className="text-white-50 md:text-xl relative z-10">
                Hi, I&apos;m Emil, a developer based in France with a passion for code
              </p>
              <Button
                className="md:w-80 md:h-16 w-64 h-12 gsap-animate"
                id="button"
                text="See my Work"
              />
            </div>
          )}
        </header>

        {/* RIGHT: 3D MODEL */}
        <figure>
          <div className="hero-3d-layout hover:cursor-grab">
            <HeroExperiences />
          </div>
        </figure>
      </div>
      <AnimatedCounter />
    </section>
  );
};
export default Hero;