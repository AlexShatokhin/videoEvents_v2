import { useState } from "react";


const useToggle = (initial : boolean = false) : [boolean, () => void] => {
    const [value, setValue] = useState<boolean>(initial);

    const toggle = () => {
        setValue(prev => !prev);   
    }

    return [value, toggle]
}

export default useToggle;