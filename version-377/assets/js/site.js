(function(){
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  document.addEventListener("DOMContentLoaded",function(){
    var btn=q("[data-menu-button]"), menu=q("[data-mobile-menu]");
    if(btn&&menu){btn.addEventListener("click",function(){menu.classList.toggle("hidden")})}
    qa("[data-hero]").forEach(function(root){
      var slides=qa(".hero-slide",root), dots=qa("[data-hero-dot]",root), index=0, timer=null;
      function show(i){if(!slides.length)return;index=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle("opacity-100",n===index);s.classList.toggle("opacity-0",n!==index)});dots.forEach(function(d,n){d.classList.toggle("bg-dawn-500",n===index);d.classList.toggle("w-8",n===index);d.classList.toggle("bg-white/50",n!==index)})}
      function next(){show(index+1)}
      var prev=q("[data-hero-prev]",root), nxt=q("[data-hero-next]",root);
      if(prev)prev.addEventListener("click",function(){show(index-1)});
      if(nxt)nxt.addEventListener("click",function(){show(index+1)});
      dots.forEach(function(d,n){d.addEventListener("click",function(){show(n)})});
      show(0);
      timer=setInterval(next,5200);
      root.addEventListener("mouseenter",function(){clearInterval(timer)});
      root.addEventListener("mouseleave",function(){timer=setInterval(next,5200)});
    });
    qa("[data-filter-scope]").forEach(function(scope){
      var input=q("[data-search-input]",scope), cat=q("[data-category-filter]",scope), year=q("[data-year-filter]",scope), cards=qa("[data-movie-card]",scope);
      function apply(){
        var kw=(input&&input.value||"").trim().toLowerCase();
        var cv=cat&&cat.value||"";
        var yv=year&&year.value||"";
        cards.forEach(function(card){
          var text=((card.getAttribute("data-title")||"")+" "+(card.getAttribute("data-tags")||"")).toLowerCase();
          var ok=(!kw||text.indexOf(kw)>-1)&&(!cv||card.getAttribute("data-category")===cv)&&(!yv||card.getAttribute("data-year")===yv);
          card.classList.toggle("is-hidden",!ok);
        });
      }
      if(input)input.addEventListener("input",apply);
      if(cat)cat.addEventListener("change",apply);
      if(year)year.addEventListener("change",apply);
    });
  });
  window.initPlayer=function(videoId,coverId,src){
    var video=document.getElementById(videoId), cover=document.getElementById(coverId), ready=false, hls=null;
    if(!video)return;
    function prepare(){
      if(ready)return;
      ready=true;
      if(video.canPlayType("application/vnd.apple.mpegurl")){
        video.src=src;
      }else if(window.Hls&&window.Hls.isSupported()){
        hls=new window.Hls({enableWorker:true});
        hls.loadSource(src);
        hls.attachMedia(video);
      }else{
        video.src=src;
      }
    }
    function start(){
      prepare();
      if(cover)cover.classList.add("is-hidden");
      var p=video.play();
      if(p&&p.catch){p.catch(function(){if(cover)cover.classList.remove("is-hidden")})}
    }
    if(cover)cover.addEventListener("click",start);
    video.addEventListener("click",function(){if(video.paused)start()});
    video.addEventListener("play",function(){if(cover)cover.classList.add("is-hidden")});
  };
})();