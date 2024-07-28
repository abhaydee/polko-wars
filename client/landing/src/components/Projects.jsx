import { Image, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";

import { motion } from "framer-motion-3d";
import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

export const projects = [
  {
    title: "Feel the Rush of Velocity",
    url: "https://r3f-wawatmos-final.vercel.app/",
    image: "projects/races.png",
    description: "Race at breakneck speeds on visually stunning tracks. Feel every thrilling moment in our vibrant racing world",
  },
  {
    title: "Win Exclusive Digital Treasures",
    url: "https://www.youtube.com/watch?v=YkHqpqJgLKw",
    image: "projects/nfts.png",
    description: "Claim exclusive NFTs as you conquer challenges. Each victory brings unique digital collectibles into your portfolio",
  },
  {
    title: "Climb the Ranks of Glory",
    url: "https://www.youtube.com/watch?v=pGMKIyALcK0",
    image: "projects/leaderboard.png",
    description: "Watch your progress in real time. Rise up the ranks and showcase your racing skills on our dynamic leaderboards",
  },
  {
    title: "Join a World of Collaboration",
    url: "https://www.youtube.com/watch?v=zwNF1-lsia8",
    image: "projects/multiplayers.png",
    description: "Engage in a diverse metaverse. Race, collaborate, and socialize in an interactive world where every interaction counts",
  },
  {
    title: "Turn Virtual Wins into Real Rewards",
    url: "https://www.youtube.com/watch?v=L12wIvuZTOY",
    image: "projects/sponspored.png",
    description: "Convert your in-game achievements into real cryptocurrency. Merge the thrill of gaming with the rewards of digital currency",
  },
  {
    title: "Elevate the Game with Brand Power",
    url: "https://www.youtube.com/watch?v=L12wIvuZTOY",
    image: "projects/coin.png",
    description: "Join high-stakes tournaments sponsored by top brands. Unique themes, exclusive rewards, and thrilling competition await!",
  },
];

const Project = (props) => {
  const { project, highlighted } = props;

  const background = useRef();
  const bgOpacity = useMotionValue(0.4);

  useEffect(() => {
    animate(bgOpacity, highlighted ? 0.7 : 0.4);
  }, [highlighted]);

  useFrame(() => {
    background.current.material.opacity = bgOpacity.get();
  });

  return (
    <group {...props}>
      <mesh
        position-z={-0.001}
        
        ref={background}
      >
       <planeGeometry args={[5.2, 4.2]} />
        <meshBasicMaterial color="black" transparent opacity={0.4} />
      </mesh>
      <Image
        scale={[5, 3, 1]}
        url={project.image}
        toneMapped={false}
        position-y={0.5}
      />
      <Text
        maxWidth={6}
        anchorX={"left"}
        anchorY={"top"}
        fontSize={0.25}
        position={[-2.5, -1.1, 0]}
      >
        {project.title.toUpperCase()}
      </Text>
      <Text
        maxWidth={5}
        anchorX="left"
        anchorY="top"
        fontSize={0.17}
        position={[-2.5, -1.5, 0]}
      >
        {project.description}
      </Text>
    </group>
  );
};

export const currentProjectAtom = atom(Math.floor(0 ));

export const Projects = () => {
  const { viewport } = useThree();
  const [currentProject] = useAtom(currentProjectAtom);

  return (
    <group position-y={-viewport.height * 2 + 1}>
      {projects.map((project, index) => (
        <motion.group
          key={"project_" + index}
          position={[index * 2.5, 0, -3]}
          animate={{
            x: 0 + (index - currentProject) * 6.5,
            y: currentProject === index ? 0 : -0.1,
            z: currentProject === index ? -4 : -3,
            rotateX: currentProject === index ? 0 : -Math.PI / 3,
            rotateZ: currentProject === index ? 0 : -0.1 * Math.PI,
          }}
        >
          <Project project={project} highlighted={index === currentProject} />
        </motion.group>
      ))}
    </group>
  );
};
