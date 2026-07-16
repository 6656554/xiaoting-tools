// ============================================================
// 小婷智能辅助 - 页面渲染 + 动效
// 数据来自 data/tools.js 中的 TOOLS 数组
// ============================================================

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 转义 HTML，防止数据中的特殊字符破坏页面 */
function esc(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

/* ---------------- 首页：工具列表 ---------------- */

function renderToolCards(list) {
  const grid = document.getElementById("tools-grid");
  if (!list.length) {
    grid.innerHTML = '<div class="empty-tip">没有找到匹配的工具</div>';
    return;
  }
  grid.innerHTML = list
    .map(
      (t, i) => `
      <div class="tool-card" style="animation-delay:${i * 70}ms">
        <div class="card-head">
          <div class="tool-icon">${esc(t.icon || "🧩")}</div>
          <div>
            <h3>${esc(t.name)}</h3>
            <div class="tool-meta">v${esc(t.version)} · ${esc(t.updated)} · ${esc(t.category)}</div>
          </div>
        </div>
        <div class="tool-summary">${esc(t.summary)}</div>
        <div class="card-actions">
          <a class="btn btn-primary" href="${esc(t.downloadUrl)}">⬇ 下载</a>
          <a class="btn btn-outline" href="tool.html?id=${encodeURIComponent(t.id)}">查看详情</a>
        </div>
      </div>`
    )
    .join("");
}

function initHomePage() {
  const grid = document.getElementById("tools-grid");
  if (!grid) return; // 不是首页

  let activeCategory = "全部";
  let keyword = "";

  function applyFilter() {
    const list = TOOLS.filter((t) => {
      const okCat = activeCategory === "全部" || t.category === activeCategory;
      const kw = keyword.trim().toLowerCase();
      const okKw =
        !kw ||
        t.name.toLowerCase().includes(kw) ||
        (t.summary || "").toLowerCase().includes(kw);
      return okCat && okKw;
    });
    renderToolCards(list);
  }

  // 根据数据自动生成分类按钮
  const cats = ["全部", ...new Set(TOOLS.map((t) => t.category))];
  const bar = document.getElementById("filter-bar");
  bar.innerHTML = cats
    .map(
      (c, i) =>
        `<button class="${i === 0 ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`
    )
    .join("");
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    bar.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.cat;
    applyFilter();
  });

  // 搜索框
  const search = document.getElementById("search-input");
  if (search) {
    search.addEventListener("input", () => {
      keyword = search.value;
      applyFilter();
    });
  }

  // 工具数量写入统计位
  const countEl = document.getElementById("tool-count");
  if (countEl) countEl.dataset.count = TOOLS.length;

  applyFilter();
  initStatCounters();
  initCardSpotlight(grid);
  initHeroParallax();
}

/* ---------------- 详情页 ---------------- */

function initDetailPage() {
  const wrap = document.getElementById("tool-detail");
  if (!wrap) return; // 不是详情页

  const id = new URLSearchParams(location.search).get("id");
  const t = TOOLS.find((x) => x.id === id);

  if (!t) {
    wrap.innerHTML =
      '<div class="detail-card"><p>没有找到这个工具，可能链接已失效。</p>' +
      '<p><a href="index.html">← 返回首页</a></p></div>';
    return;
  }

  document.title = t.name + " - 小婷智能辅助";

  const descHtml = (t.description || "")
    .split("\n")
    .filter((s) => s.trim())
    .map((s) => `<p>${esc(s)}</p>`)
    .join("");

  const featuresHtml = (t.features || [])
    .map((f) => `<li>${esc(f)}</li>`)
    .join("");

  const changelogHtml = (t.changelog || [])
    .map(
      (c) => `
      <div class="changelog-item">
        <div class="cl-head">v${esc(c.version)}<span class="cl-date">${esc(c.date)}</span></div>
        <ul>${(c.notes || []).map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
      </div>`
    )
    .join("");

  const shaHtml = t.sha256
    ? `<h2 style="margin-top:26px">文件校验（SHA256）</h2>
       <p>下载后可核对校验值，确认文件完整且未被篡改：</p>
       <div class="sha-box">${esc(t.sha256)}</div>`
    : "";

  const videoHtml = t.video
    ? `<div class="detail-card">
         <h2>宣传视频</h2>
         <video class="promo-video" src="${esc(t.video)}" controls preload="metadata"></video>
       </div>`
    : "";

  wrap.innerHTML = `
    <div class="breadcrumb"><a href="index.html">首页</a> / ${esc(t.name)}</div>

    <div class="detail-card">
      <div class="detail-head">
        <div class="tool-icon">${esc(t.icon || "🧩")}</div>
        <div class="head-info">
          <h1>${esc(t.name)}</h1>
          <div class="tool-meta">最近更新：${esc(t.updated)}</div>
          <div class="tag-row">
            <span class="tag">v${esc(t.version)}</span>
            <span class="tag">${esc(t.category)}</span>
            <span class="tag">${esc(t.requirements || "Windows")}</span>
          </div>
        </div>
      </div>
      <div class="download-area">
        <a class="btn btn-primary btn-lg" href="${esc(t.downloadUrl)}">⬇ 立即下载</a>
        <div class="file-info">
          文件大小：${esc(t.fileSize || "—")}<br>
          遇到浏览器拦截或杀毒提示？<a href="guide.html">查看说明</a>
        </div>
      </div>
    </div>

    ${videoHtml}

    <div class="detail-card">
      <h2>工具介绍</h2>
      ${descHtml}
      ${featuresHtml ? `<h2 style="margin-top:26px">功能亮点</h2><ul class="feature-list">${featuresHtml}</ul>` : ""}
      ${shaHtml}
    </div>

    ${changelogHtml ? `<div class="detail-card"><h2>更新日志</h2>${changelogHtml}</div>` : ""}
  `;
}

/* ---------------- 动效：数字滚动 ---------------- */

function initStatCounters() {
  const els = document.querySelectorAll(".stat-number .num");
  // 减弱动效偏好，或页面在后台（rAF 会被浏览器暂停）时，直接显示最终值
  if (REDUCED_MOTION || document.hidden) {
    els.forEach((el) => {
      el.textContent = el.dataset.count || el.textContent;
    });
    return;
  }
  els.forEach((el) => {
    const target = parseInt(el.dataset.count || "0", 10);
    const dur = 1400;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ---------------- 动效：卡片聚光灯跟随 ---------------- */

function initCardSpotlight(grid) {
  if (REDUCED_MOTION || !window.matchMedia("(hover: hover)").matches) return;
  grid.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".tool-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  });
}

/* ---------------- 动效：横幅背景巨字视差 ---------------- */

function initHeroParallax() {
  if (REDUCED_MOTION) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        hero.style.setProperty("--hero-shift", window.scrollY * 0.22 + "px");
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* ---------------- 动效：滚动显现 ---------------- */

function initScrollReveal() {
  const targets = document.querySelectorAll(".faq-item, .detail-card, .section-head");
  if (!targets.length) return;
  // 后台标签页中 IntersectionObserver 可能不触发，保持内容直接可见
  if (REDUCED_MOTION || document.hidden || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = Math.min(i * 60, 240) + "ms";
    io.observe(el);
  });
}

/* ---------------- 动效：顶部阅读进度条 ---------------- */

function initScrollProgress() {
  if (REDUCED_MOTION) return;
  const bar = document.createElement("div");
  bar.id = "scroll-progress";
  document.body.appendChild(bar);
  let ticking = false;
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

/* ---------------- 启动 ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
  initDetailPage();
  initScrollReveal();
  initScrollProgress();
});
