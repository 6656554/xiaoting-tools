// ============================================================
// 小婷智能辅助 - 页面渲染逻辑
// 数据来自 data/tools.js 中的 TOOLS 数组
// ============================================================

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
      (t) => `
      <div class="tool-card">
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

  applyFilter();
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

    <div class="detail-card">
      <h2>工具介绍</h2>
      ${descHtml}
      ${featuresHtml ? `<h2 style="margin-top:26px">功能亮点</h2><ul class="feature-list">${featuresHtml}</ul>` : ""}
      ${shaHtml}
    </div>

    ${changelogHtml ? `<div class="detail-card"><h2>更新日志</h2>${changelogHtml}</div>` : ""}
  `;
}

/* ---------------- 启动 ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
  initDetailPage();
});
