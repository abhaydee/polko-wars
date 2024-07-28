import { ValidationError, useForm } from "@formspree/react";
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiGlobe,
  FiYoutube,
  FiInstagram,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { currentProjectAtom, projects } from "./Projects";

const Section = (props) => {
  const { children, mobileTop } = props;

  return (
    <motion.section
      className={`
  h-screen w-screen p-8 max-w-screen-2xl mx-auto
  flex flex-col items-start
  ${mobileTop ? "justify-start md:justify-center" : "justify-center"}
  `}
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 1,
          delay: 0.6,
        },
      }}
    >
      {children}
    </motion.section>
  );
};

export const Interface = (props) => {
  const { setSection } = props;
  return (
    <div className="flex flex-col items-center w-screen">
      <AboutSection setSection={setSection} />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
};

const AboutSection = (props) => {
  const { setSection } = props;
  return (
    <Section mobileTop>
      <h1 className="text-3xl md:text-6xl font-extrabold leading-snug mt-8 md:mt-0 text-custom-gray  ">
      Welcome to Polko-Wars
        <br />
        
        
      </h1>
      <span className="text-3xl md:text-6xl font-extrabold leading-snug  md:mt-0 text-custom-gray bg-white px-1 italic ">Race, Collect, Own</span>
      <motion.p
        className="bg-white text-xl font-bold text-custom-voilet mt-4"
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1,
          delay: 1.5,
        }}
      >
        Dive into a dynamic world of gaming, challenges, and rewards
        
      </motion.p>
      <motion.button
        onClick={() => window.open("http://localhost:3000/")}
        className={`bg-indigo-600 text-white py-4 px-8 
      rounded-lg font-bold text-lg mt-4 md:mt-16`}
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1,
          delay: 2,
        }}
      >
        Get Started
      </motion.button>
    </Section>
  );
};

const skills = [
  {
    title: "Polko-Wars is an innovative NFT Racing Challenge 3D Game with immersive gameplay",
    level: 100,
  },
  {
    title: "Engage in daily tournaments, navigate unique tracks, and compete for exclusive NFTs and rewards",
    level: 100,
  },
  {
    title: "Experience multiplayer interactions, dynamic events, and collaborative partnerships within a vibrant virtual world",
    level: 100,
  },
  
];
const languages = [
  {
    title: "🇫🇷 French",
    level: 100,
  },
  {
    title: "🇺🇸 English",
    level: 80,
  },
  {
    title: "🇯🇵 Japanese",
    level: 20,
  },
];

const SkillsSection = () => {
  return (
    <Section>
      <motion.div className="w-full" whileInView={"visible"}>
        <h2 className="text-xl md:text-5xl font-bold text-white  mb-16 md:mb-32">Discover Polko-Wars:  Your Gateway to the Immersive Gameplay</h2>
        <div className=" space-y-4">
          {skills.map((skill, index) => (
            <div className="w-full md:w-100" key={index}>
              <motion.h3
                className="text-sm md:text-2xl font-bold text-gray-100 mt-5 mb-5"
                initial={{
                  opacity: 0,
                }}
                variants={{
                  visible: {
                    opacity: 1,
                    transition: {
                      duration: 1,
                      delay: 1 + index * 0.2,
                    },
                  },
                }}
              >
                {skill.title}
              </motion.h3>
              <div className="h-2 w-2000 bg-gray-200 rounded-full mt-2 mb-16">
                <motion.div
                  className="h-full w-200  bg-indigo-500 rounded-full  "
                  style={{ width: `${skill.level}%` }}
                  initial={{
                    scaleX: 0,
                    originX: 0,
                  }}
                  variants={{
                    visible: {
                      scaleX: 1,
                      transition: {
                        duration: 1,
                        delay: 1 + index * 0.2,
                      },
                    },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* <div>
          <h2 className="text-3xl md:text-5xl font-bold mt-10 text-white">
            Languages
          </h2>
          <div className="mt-8 space-y-4">
            {languages.map((lng, index) => (
              <div className="w-full md:w-64" key={index}>
                <motion.h3
                  className="text-lg md:text-xl font-bold text-gray-100"
                  initial={{
                    opacity: 0,
                  }}
                  variants={{
                    visible: {
                      opacity: 1,
                      transition: {
                        duration: 1,
                        delay: 2 + index * 0.2,
                      },
                    },
                  }}
                >
                  {lng.title}
                </motion.h3>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full "
                    style={{ width: `${lng.level}%` }}
                    initial={{
                      scaleX: 0,
                      originX: 0,
                    }}
                    variants={{
                      visible: {
                        scaleX: 1,
                        transition: {
                          duration: 1,
                          delay: 2 + index * 0.2,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </motion.div>
    </Section>
  );
};

const ProjectsSection = () => {
  const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);

  const nextProject = () => {
    setCurrentProject((currentProject + 1) % projects.length);
  };

  const previousProject = () => {
    setCurrentProject((currentProject - 1 + projects.length) % projects.length);
  };

  return (
    <Section>
      <div className="flex w-full h-full gap-8 mt-72 items-center justify-center">
        <button
          className="hover:text-indigo-600 transition-colors"
          onClick={previousProject}
        >
          ← Previous
        </button>
        <h2 className="text-3xl md:text-5xl font-bold">Features</h2>
        <button
          className="hover:text-indigo-600 transition-colors"
          onClick={nextProject}
        >
          Next →
        </button>
      </div>
    </Section>
  );
};


const socialLinks = [
  
];

const ContactSection = () => {
  const [state, handleSubmit] = useForm("mayzgjbd");
  return (
    <Section>
      <h2 className="text-2xl md:text-5xl font-bold font-mono">Join the Polko-Wars Community</h2>
      <h3 className="text-lg md:text-2xl font-medium md:mt-4  " >Become Part of the Polko-Wars Family</h3>
      <div className="mt-8 p-8 rounded-md bg-white bg-opacity-50 w-96 max-w-full">
         
        

        <div className="container mx-auto">
          <button onClick={() => window.open("http://localhost:3000/")}  className="bg-indigo-600 text-white py-4 px-8 rounded-lg font-bold text-lg md:ml-12 ml-10 ">
            Start Your Engines
          </button>
      <div >
        {/* Footer social links */}
        {/* <div className="font-general-regular flex flex-col justify-center items-center mb-12 sm:mb-28">
          <p className="text-3xl sm:text-4xl text-primary-dark dark:text-primary-light mb-5 font-sans">
            
          </p>
          <ul className="flex gap-4 sm:gap-8">
            {socialLinks.map((link) => (
              <a
                href={link.url}
                target="__blank"
                key={link.id}
                className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer rounded-lg bg-gray-50 dark:bg-ternary-dark hover:bg-gray-100 shadow-sm p-4 duration-300"
              >
                <i className="text-xl sm:text-2xl md:text-3xl">{link.icon}</i>
              </a>
            ))}
          </ul>
        </div> */}
      </div>
    </div>

    
          
        
      </div>
    </Section>
  );
};
