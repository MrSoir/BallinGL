"use strict";

function setTag(id, val=1){
	let tag = document.getElementById(id);
  tag.innerHTML = id + ': ' + val;
}

var xxx = {
    f: function(tag, val){
        setTag(tag, val);
    },
};

export {xxx};
