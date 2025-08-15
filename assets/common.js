try {
  const ping = {
    t: Date.now(),
    path: location.pathname + location.search + location.hash,
    ua: navigator.userAgent,
    lang: navigator.language
  };
  // console.log('analytics', ping);
  // Tu peux POST vers ton backend plus tard
} catch(e){}
