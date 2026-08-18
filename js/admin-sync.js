(function(){
  const KEY='streamflix_admin_catalog_v1';
  const TREND='streamflix_admin_trending_v1';
  const SETTINGS='streamflix_admin_settings_v1';
  window.StreamflixAdmin={
    key:KEY,
    loadCatalog(){
      let saved={}; try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
      window.MOVIES=Object.assign({},window.MOVIES||{},saved);
      return window.MOVIES;
    },
    saveCatalog(c){localStorage.setItem(KEY,JSON.stringify(c)); window.MOVIES=c; window.dispatchEvent(new CustomEvent('streamflix:catalog',{detail:c}));},
    getTrending(){try{return JSON.parse(localStorage.getItem(TREND)||'[]')}catch(e){return []}},
    setTrending(ids){localStorage.setItem(TREND,JSON.stringify(ids.map(String))); window.dispatchEvent(new CustomEvent('streamflix:trending',{detail:ids}));},
    getSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS)||'{}')}catch(e){return {}}},
    setSettings(v){localStorage.setItem(SETTINGS,JSON.stringify(v));}
  };
  window.StreamflixAdmin.loadCatalog();
})();
