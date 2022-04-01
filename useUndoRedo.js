/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {useState,useEffect} from 'react';
import {undoRedo} from './undo-redo';

export function useUndoRedo(stackSize,workObj,keyBinding){
    const [workObjState,setWorkObjState]= useState(()=>{return workObj});


    const [value,setValue]=useState(() => {
        return undoRedo(stackSize,workObjState)
    });

    useEffect(()=>{
        value.save(workObjState);
        
    },[workObjState])

    useEffect(()=>{
        function handleKeyDown(event){
            if(keyBinding && event.target.tagName.toUpperCase() != 'INPUT'){
            if(keyBinding.bindUndoKey && keyBinding.undoKeys.includes(event.key))
                undo()
            if(keyBinding.bindRedoKey && keyBinding.redoKeys.includes(event.key))
                redo()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
            
        return () => {
            document.removeEventListener('keydown',handleKeyDown)
        }
    })

    function undo(){
        value.undo(workObjState);
        setWorkObjState(JSON.parse(localStorage['lastSav']));
    }
    function redo(){
        value.redo(workObjState);
        setWorkObjState(JSON.parse(localStorage['lastSav']));
    }
    
    return [workObjState,setWorkObjState,undo,redo];
}