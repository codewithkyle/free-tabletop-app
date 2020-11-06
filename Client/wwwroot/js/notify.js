class t extends HTMLElement{constructor(t){super(),this.handleActionButtonClick=t=>{const e=t.currentTarget,s=parseInt(e.dataset.index);this.settings.buttons[s].callback()},this.handleCloseClickEvent=()=>{this.remove()},this.settings=t,this.render()}render(){this.dataset.uid=this.settings.uid;for(let t=0;t<this.settings.classes.length;t++)this.classList.add(this.settings.classes[t]);const t=document.createElement("p");if(t.innerText=this.settings.message,this.appendChild(t),this.settings.closeable||this.settings.buttons.length){const t=document.createElement("snackbar-actions");if(this.settings.buttons.length)for(let e=0;e<this.settings.buttons.length;e++){const s=document.createElement("button");s.innerText=this.settings.buttons[e].label,s.dataset.index=""+e;for(let t=0;t<this.settings.buttons[e].classes.length;t++)s.classList.add(this.settings.buttons[e].classes[t]);this.settings.buttons[e].ariaLabel&&s.setAttribute("aria-label",this.settings.buttons[e].ariaLabel),s.addEventListener("click",this.handleActionButtonClick),t.appendChild(s)}if(this.settings.closeable){const e=document.createElement("button");e.setAttribute("aria-label","close notification"),e.classList.add("close"),e.innerHTML='<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="times" class="svg-inline--fa fa-times fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>',e.addEventListener("click",this.handleCloseClickEvent),t.appendChild(e)}this.appendChild(t)}}}class e extends HTMLElement{constructor(t){super(),this.handleCloseClickEvent=()=>{this.remove()},this.settings=t,this.render()}render(){this.dataset.uid=this.settings.uid;for(let t=0;t<this.settings.classes.length;t++)this.classList.add(this.settings.classes[t]);if(this.settings.icon){const t=document.createElement("i");t.innerHTML=this.settings.icon,this.appendChild(t)}const t=document.createElement("copy-wrapper"),e=document.createElement("h3");e.innerText=this.settings.title,t.appendChild(e);const s=document.createElement("p");if(s.innerText=this.settings.message,t.appendChild(s),this.appendChild(t),this.settings.closeable){const t=document.createElement("button");t.setAttribute("aria-label","close notification"),t.innerHTML='<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="times" class="svg-inline--fa fa-times fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>',t.addEventListener("click",this.handleCloseClickEvent),this.appendChild(t)}}}class s{constructor(){this.snackbarQueue=[],this.toaster=[],this.time=performance.now(),this.loop()}uid(){return new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-")}loop(){var e,s,n,i;const l=performance.now(),o=(l-this.time)/1e3;if(this.time=l,document.hasFocus()){for(let t=this.toaster.length-1;t>=0;t--)(null===(e=this.toaster[t])||void 0===e?void 0:e.duration)&&Infinity!==(null===(s=this.toaster[t])||void 0===s?void 0:s.duration)&&(this.toaster[t].duration-=o,this.toaster[t].duration<=0&&(this.toaster[t].el.remove(),this.toaster.splice(t,1)));this.snackbarQueue.length&&(this.snackbarQueue[0].el||(this.snackbarQueue[0].el=new t(this.snackbarQueue[0]),document.body.appendChild(this.snackbarQueue[0].el)),(null===(n=this.snackbarQueue[0])||void 0===n?void 0:n.duration)&&Infinity!==(null===(i=this.snackbarQueue[0])||void 0===i?void 0:i.duration)&&(this.snackbarQueue[0].duration-=o,this.snackbarQueue[0].duration<=0&&(this.snackbarQueue[0].el.remove(),this.snackbarQueue.splice(0,1))))}window.requestAnimationFrame(this.loop.bind(this))}snackbar(t){var e,s,n,i,l,o,a;const c={};if(!(null==t?void 0:t.message)||0===(null===(e=null==t?void 0:t.message)||void 0===e?void 0:e.length))return;c.message=t.message,c.uid=this.uid(),c.el=null;let r=[];(null==t?void 0:t.classes)&&(r=Array.isArray(t.classes)?t.classes:[t.classes]),c.classes=r,"number"==typeof(null==t?void 0:t.duration)||Infinity===(null==t?void 0:t.duration)?c.duration=t.duration:c.duration=3,void 0!==(null==t?void 0:t.closeable)&&"boolean"==typeof(null==t?void 0:t.closeable)?c.closeable=null==t?void 0:t.closeable:c.closeable=!0,void 0!==(null==t?void 0:t.force)&&"boolean"==typeof(null==t?void 0:t.force)?c.force=null==t?void 0:t.force:c.force=!1;let u=[];(null==t?void 0:t.buttons)&&(u=Array.isArray(t.buttons)?t.buttons:[t.buttons]),c.buttons=u;for(let t=0;t<c.buttons.length;t++)(null===(s=c.buttons[t])||void 0===s?void 0:s.classes)&&!Array.isArray(null===(n=c.buttons[t])||void 0===n?void 0:n.classes)&&(c.buttons[t].classes=[c.buttons[t].classes]),(null===(i=c.buttons[t])||void 0===i?void 0:i.ariaLabel)||(c.buttons[t].ariaLabel=null),(null===(l=c.buttons[t])||void 0===l?void 0:l.label)&&0!==(null===(o=c.buttons[t])||void 0===o?void 0:o.label.length)||(c.buttons[t].label="Missing label"),(null===(a=c.buttons[t])||void 0===a?void 0:a.callback)||(c.buttons[t].callback=()=>{});c.force&&this.snackbarQueue.length?(this.snackbarQueue[0].el.remove(),this.snackbarQueue.splice(0,1,c)):this.snackbarQueue.push(c)}toast(t){var s,n;const i={};if(!(null==t?void 0:t.message)||0===(null===(s=null==t?void 0:t.message)||void 0===s?void 0:s.length))return;if(!(null==t?void 0:t.title)||0===(null===(n=null==t?void 0:t.title)||void 0===n?void 0:n.length))return;i.title=t.title,i.message=t.message,i.uid=this.uid();let l=[];(null==t?void 0:t.classes)&&(l=Array.isArray(t.classes)?t.classes:[t.classes]),i.classes=l,"number"==typeof(null==t?void 0:t.duration)||Infinity===(null==t?void 0:t.duration)?i.duration=t.duration:i.duration=3,void 0!==(null==t?void 0:t.closeable)&&"boolean"==typeof(null==t?void 0:t.closeable)?i.closeable=t.closeable:i.closeable=!0,(null==t?void 0:t.icon)&&"string"==typeof(null==t?void 0:t.icon)?i.icon=t.icon:i.icon=null,i.el=new e(i),this.toaster.push(i);let o=document.body.querySelector("toaster-component")||null;o||(o=document.createElement("toaster-component"),document.body.appendChild(o));const a=o.querySelector("toast-component")||null;a?o.insertBefore(i.el,a):o.appendChild(i.el)}}const n=new s,i=n.snackbar.bind(n),l=n.toast.bind(n);customElements.define("snackbar-component",t),customElements.define("toast-component",e);