import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const ShowcaseSection = () => {
  const sectionRef = useRef(null);
  const project1Ref = useRef(null);
  const project2Ref = useRef(null);
  const project3Ref = useRef(null);


  useGSAP(() => {
    const projects = [project1Ref.current, project2Ref.current, project3Ref.current];
    gsap.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5 });
    projects.forEach((card, index) => {
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, delay: 0.4 * (index + 1),
          scrollTrigger: {
            trigger: card,
            start: "center bottom-=100"
          }
        }
      );
    });
  }, []);

  return (
    <div id="work" className="app-showcase" ref={sectionRef}>
      <div className="w-full">
        <div className="showcaselayout">
          {/* Left */}
          <div className="first-project-wrapper" ref={project1Ref}>
            <div className="image-wrapper">
              <img src="./images/project1.png" alt="online-music-learning-platform" />
            </div>
            <div className="text-content">
              <h2>Learn Music Anytime, Anywhere with Our Modern Online Platform</h2>
              <p className="text-white-50 md:text-xl">
                A fullstack MERN app designed for smooth, interactive learning—ideal for students and teachers alike.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="project-list-wrapper overflow-hidden">
            <div className="project" ref={project2Ref}>
              <div className="image-wrapper bg-[#ffefdb]">
                <img src="/images/project2.png" alt="fullstack-mern-stack-app" />
              </div>
              <h2>A dynamic MERN-based chat app offering smooth, responsive communication between users.</h2>
            </div>
            <div className="project" ref={project3Ref}>
              <div className="image-wrapper bg-[#ffe7eb]">
                <img src="/images/project3.png" alt="pet-adoption-platform" />
              </div>
              <h2>A smart pet adoption platform built to simplify the search and match process for loving homes.</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShowcaseSection;