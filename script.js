// 모바일 메뉴(햄버거 ☰) 열고 닫기
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".nav-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => menu.classList.toggle("open"));
  // 메뉴 항목을 누르면 자동으로 닫히게
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => menu.classList.remove("open"));
  });
}

// 홈 히어로: 스크롤 시간에 맞춰 겹친 오간자가 걷히도록 합니다.
const heroScene = document.querySelector(".hero-scene");
const hero = heroScene && heroScene.querySelector(".hero");

if (heroScene && hero) {
  let scheduled = false;

  function updateHeroFabric() {
    const sceneTop = heroScene.getBoundingClientRect().top;
    const travel = Math.max(heroScene.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-sceneTop / travel, 0), 1);

    hero.style.setProperty("--hero-progress", progress.toFixed(4));
    scheduled = false;
  }

  function requestHeroUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateHeroFabric);
  }

  updateHeroFabric();
  window.addEventListener("scroll", requestHeroUpdate, { passive: true });
  window.addEventListener("resize", requestHeroUpdate);
}
