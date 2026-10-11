// Apply before styles load. Older notebooks keep their saved light or dark choice.
(()=>{
 let saved;try{saved=JSON.parse(localStorage.getItem('thinkroom-v1')||'{}')?.theme;}catch{}
 const theme=saved==='light'||saved==='dark'?saved:(globalThis.matchMedia?.('(prefers-color-scheme: light)').matches?'light':'dark');
 document.documentElement.dataset.theme=theme;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='light'?'#e7ebef':'#0b111a');
})();
