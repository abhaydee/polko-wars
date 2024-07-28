import { useAnimations, useFBX, useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { useEffect } from 'react'

export default function NewTrack()
{
    const fox = useGLTF('./New Track/scene.gltf')
    // console.log(fox)
    const animations = useAnimations(fox.animations, fox.scene)
    // console.log(animations)

    const {animationName} = useControls({
        animationName: {options: animations.names}
    })
    
    useEffect(() => {
        const actions = animations.actions[animationName]
        // console.log(actions)
        actions.reset().fadeIn(0.5).play()

        return() => {
            actions.fadeOut(0.5)
        }

    },[animationName])

        return <primitive
            object={ fox.scene }
            scale={4}
            position={ [  1.8, -24, 2.5 ] }
            
        />
}