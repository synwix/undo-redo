export function undoRedo(stackSize,workObj){
	stackSize=stackSize || 10;
	
	let stUndo=[];      
	let stRedo=[];		
	let lastSav;		
	
	const L=localStorage;
	


	function save(workObj){
		const mod={l:1}; //to track which variable need syncing to LS
		const w=JSON.stringify(workObj);
		
		if(lastSav && JSON.stringify(lastSav)==w) return; //nothing changed, nothing to save

		if(lastSav) {
			stUndo.push(lastSav);
			if(stUndo.length>stackSize) stUndo.shift(); //removing the oldest one, if too many states have been saved
			mod.u=1
		};
		if(stRedo.length>0) {stRedo.length=0;mod.r=1};    //saving a new state invalidates the redo stack
		lastSav=JSON.parse(w); //object duplication 
		syncLS(mod);
	}

	function undo(workObj){
		save(workObj);
		if(stUndo.length>0) {
			stRedo.push(lastSav);
			lastSav=stUndo.pop();
			extend(workObj,lastSav);
			syncLS(null);  //sync all
		}
	}

	function redo(workObj){
		save(workObj);
		if(stRedo.length>0) {
			stUndo.push(lastSav);
			lastSav=stRedo.pop();
			extend(workObj,lastSav);
			syncLS(null);  //sync all
		}		
	}

	function clear(){
		localStorage.clear();
		lastSav=false;
		stUndo.length=0;
		stRedo.length=0;
	}

//check if there was anything left behind from last session
//restore record if anything was saved previously
	if(L.lastSav) {
		lastSav=JSON.parse(L.lastSav);
		extend(workObj,lastSav);  //restoring the last saved state
		if(L.stUndo) stUndo=JSON.parse(L.stUndo);  //restoring undo stack
		if(L.stRedo) stRedo=JSON.parse(L.stRedo);  //restoring redo stack
	}


//special `extend` which deletes arrays in the target to accomodate restoring decreasing arrays
	function extend (target, source) {
	  target = target || {};
	  if(Array.isArray(target)){ //if it's an array
		while(target.length > 0) {  //empty the array
    		target.pop();
		}
	  
	  for (const prop in source) {  //do a deep copy of the object recursively
	    if (typeof source[prop] === 'object') {
	      target[prop] = extend(target[prop], source[prop]);
	    } else {
	      target[prop] = source[prop];
	    }
	  }
	  }
	  return target;
	}	

	//syncing (saving) to LocalStorage
	function syncLS(what){
		what= what || {u:1,l:1,r:1};  //U=undo, L=lastSav, R=redo
		if(what.u) L.stUndo=JSON.stringify(stUndo);
		if(what.r) L.stRedo=JSON.stringify(stRedo);
		if(what.l) L.lastSav=JSON.stringify(lastSav);
	}

	function currentObj(){
		if(localStorage['lastSav'])
		return JSON.parse(localStorage['lastSav']);
	}

	return {
		currentObj: currentObj,
		save: save,
		undo: undo,
		redo: redo,
		clear: clear,
		hasUndo: function(){return stUndo.length>0},
		hasRedo: function(){return stRedo.length>0},
	}
}