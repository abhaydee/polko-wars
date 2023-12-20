import { useAnimations, useGLTF } from '@react-three/drei'

import { useEffect } from 'react'

export const  Office = () => {
{
    const track = useGLTF('./Track/scene.gltf')
    const animations = useAnimations(track.animations, track.scene)
    
    useEffect(() => {
        const action = animations.actions.Main
        action.play()
    }, [] )
    
    

        return <primitive
            object={ track.scene }
            scale={ 0.02 }
            position={ [ - 2.5, 0, 2.5 ] }
            rotation={ [-0.2,0,-0.3] }
        />
}
}