document.addEventListener("DOMContentLoaded", () => {

    const projectList = document.getElementById("projectList");
    const slider = document.getElementById("slider");
    const viewerTitle = document.getElementById("viewerTitle");
    const pageIndicator = document.getElementById("pageIndicator");

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomOutBtn = document.getElementById("zoomOut");

    let currentPage = 1;
    let totalPages = 0;
    let images = [];

    let zoomLevel = 1;
    let baseImageWidth = 0;
    let baseImageHeight = 0;

    let is2026_1Project = false;
    let is2026_2Project = false;

    fetch("project-list.json", { cache: "no-store" })
        .then(res => res.json())
        .then(projects => {

            projects.forEach((project) => {

                const btn = document.createElement("div");
                btn.className = "pdf-btn";
                btn.textContent = project.title;

                btn.onclick = () => {

                    document.querySelectorAll(".pdf-btn")
                        .forEach(b => b.classList.remove("active"));

                    btn.classList.add("active");

                    loadProject(project);
                };

                projectList.appendChild(btn);
            });

            renderEmpty();
        })
        .catch(() => {
            slider.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <div class="empty-title">Project list load failed</div>
                    <div class="empty-desc">project-list.json 파일을 확인하세요.</div>
                </div>
            `;

            viewerTitle.textContent = "Portfolio Viewer";
            pageIndicator.textContent = "";
        });

    function renderEmpty() {

        slider.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">📁</div>

                <div class="empty-title">
                    Select a Project
                </div>

                <div class="empty-desc">
                    Choose a portfolio above to view slides
                </div>

            </div>
        `;

        viewerTitle.textContent = "Portfolio Viewer";
        pageIndicator.textContent = "";
    }

    function loadProject(project) {

        document.body.classList.add("viewer-active");

        slider.innerHTML = "";
        viewerTitle.textContent = project.title;

        is2026_1Project = project.path.includes("2026_1");
        is2026_2Project = project.path.includes("2026_2");

        images = loadImages(project.path, project.pages);

        totalPages = images.length;
        currentPage = 1;

        resetZoom();

        renderPage();
        updatePageIndicator();
    }

    function loadImages(path, pages) {

        const result = [];
        const cacheBuster = Date.now();

        for (let i = 1; i <= pages; i++) {

            const num = String(i).padStart(3, "0");

            result.push(`${path}/${num}.jpg?v=${cacheBuster}`);
        }

        return result;
    }

    function renderPage() {

        slider.innerHTML = "";

        if (!images.length) {
            pageIndicator.textContent = "0 / 0";
            return;
        }

        const src = images[currentPage - 1];

        const pageDiv = document.createElement("div");
        pageDiv.className = "page";

        const viewport = document.createElement("div");
        viewport.className = "pan-viewport";

        const content = document.createElement("div");
        content.className = "pan-content";

        const loader = document.createElement("div");
        loader.className = "loader";

        content.appendChild(loader);
        viewport.appendChild(content);
        pageDiv.appendChild(viewport);
        slider.appendChild(pageDiv);

        const img = new Image();
        img.src = src;

        img.onload = () => {

            content.innerHTML = "";
            content.appendChild(img);

            requestAnimationFrame(() => {
                setBaseImageSize(img, viewport);
                applyZoom(true);
            });

            renderResourceBox();
        };

        img.onerror = () => {
            content.innerHTML = "<div style='color:#aaa;padding:40px'>Image load failed</div>";
        };

        preloadNextImage();
    }

    function setBaseImageSize(img, viewport) {

        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        const availableWidth = viewport.clientWidth;
        const availableHeight = viewport.clientHeight - 80;

        const widthRatio = availableWidth / naturalWidth;
        const heightRatio = availableHeight / naturalHeight;

        const fitRatio = Math.min(widthRatio, heightRatio);

        baseImageWidth = naturalWidth * fitRatio;
        baseImageHeight = naturalHeight * fitRatio;

        img.style.width = `${baseImageWidth}px`;
        img.style.height = `${baseImageHeight}px`;
    }

    function resetZoom() {
        zoomLevel = 1;
        baseImageWidth = 0;
        baseImageHeight = 0;
    }

    function applyZoom(isInitial = false) {

        const viewport = document.querySelector(".pan-viewport");
        const content = document.querySelector(".pan-content");
        const img = document.querySelector(".page img");

        if (!viewport || !content || !img) return;

        if (!baseImageWidth || !baseImageHeight) {
            setBaseImageSize(img, viewport);
        }

        const prevScrollWidth = viewport.scrollWidth;
        const prevScrollHeight = viewport.scrollHeight;

        const centerX =
            prevScrollWidth > viewport.clientWidth
                ? (viewport.scrollLeft + viewport.clientWidth / 2) / prevScrollWidth
                : 0.5;

        const centerY =
            prevScrollHeight > viewport.clientHeight
                ? (viewport.scrollTop + viewport.clientHeight / 2) / prevScrollHeight
                : 0.5;

        const nextWidth = baseImageWidth * zoomLevel;
        const nextHeight = baseImageHeight * zoomLevel;

        img.style.width = `${nextWidth}px`;
        img.style.height = `${nextHeight}px`;

        content.style.width = `${Math.max(viewport.clientWidth, nextWidth)}px`;
        content.style.height = `${Math.max(viewport.clientHeight, nextHeight)}px`;

        requestAnimationFrame(() => {

            if (isInitial || zoomLevel === 1) {
                viewport.scrollLeft = 0;
                viewport.scrollTop = 0;
                return;
            }

            viewport.scrollLeft = viewport.scrollWidth * centerX - viewport.clientWidth / 2;
            viewport.scrollTop = viewport.scrollHeight * centerY - viewport.clientHeight / 2;
        });
    }

    function renderResourceBox() {

        if (currentPage === totalPages && is2026_1Project) {
            appendResourceBox(`
                <p>🔗 Project Resources</p>
                <div>
                    <a href="https://github.com/exit8-ktcloud/self-managed-infrastructure" target="_blank" style="color: #0366d6;">📁 Github</a>
                    <a href="https://youtu.be/EUB7CBObaXs" target="_blank" style="color: #d32f2f;">🎬 Demo</a>
                </div>
            `);
        }

        if (currentPage === totalPages && is2026_2Project) {
            appendResourceBox(`
                <p>🔗 Project Resources</p>
                <div>
                    <a href="https://app.notion.com/p/SEO-585550ea881b4f2eb8f110b0b27af2be" target="_blank" style="color: #0366d6;">📁 Notion</a>
                    <a href="2026-backend-devops-observability-code-review.html" target="_blank" style="color: #0366d6;">✏️ 코드리뷰</a>
                </div>
            `);
        }

        if (currentPage === 3 && is2026_2Project) {
            appendResourceBox(`
                <p>🔗 Project Resources</p>
                <div>
                    <a href="https://github.com/seoheejung/server-monitor" target="_blank" style="color: #0366d6;">📁 Github</a>
                </div>
            `);
        }

        if (currentPage === 10 && is2026_2Project) {
            appendResourceBox(`
                <p>🔗 Project Resources</p>
                <div>
                    <a href="https://github.com/seoheejung/circuit-breaker-tester" target="_blank" style="color: #0366d6;">📁 Github</a>
                </div>
            `);
        }

        if (currentPage === 17 && is2026_2Project) {
            appendResourceBox(`
                <p>🔗 Project Resources</p>
                <div>
                    <a href="https://github.com/seoheejung/k6-realtime-metrics-pipeline" target="_blank" style="color: #0366d6;">📁 Github</a>
                </div>
            `);
        }

        if (currentPage === 26 && is2026_2Project) {
            appendResourceBox(`
                <p>🔗 Project Resources</p>
                <div>
                    <a href="https://github.com/seoheejung/self-hosted-devops-platform" target="_blank" style="color: #0366d6;">📁 Github</a>
                </div>
            `);
        }
    }

    function appendResourceBox(innerHtml) {

        const resourceBox = document.createElement("div");
        resourceBox.className = "resource-box";
        resourceBox.innerHTML = innerHtml;

        slider.appendChild(resourceBox);
    }

    function preloadNextImage() {

        const next = images[currentPage];

        if (next) {
            const preload = new Image();
            preload.src = next;
        }
    }

    function updatePageIndicator() {
        pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    }

    nextBtn.onclick = () => {

        if (currentPage >= totalPages) return;

        currentPage++;

        resetZoom();

        renderPage();
        updatePageIndicator();
    };

    prevBtn.onclick = () => {

        if (currentPage <= 1) return;

        currentPage--;

        resetZoom();

        renderPage();
        updatePageIndicator();
    };

    document.addEventListener("keydown", (e) => {

        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === "ArrowRight") {
            nextBtn.click();
        }

        if (e.key === "ArrowLeft") {
            prevBtn.click();
        }
    });

    slider.addEventListener("wheel", (e) => {

        if (zoomLevel > 1) {
            return;
        }

        if (e.deltaY > 0) {
            nextBtn.click();
        } else {
            prevBtn.click();
        }
    });

    zoomInBtn.onclick = () => {

        zoomLevel = Math.min(2.5, Number((zoomLevel + 0.1).toFixed(1)));

        applyZoom();
    };

    zoomOutBtn.onclick = () => {

        zoomLevel = Math.max(1, Number((zoomLevel - 0.1).toFixed(1)));

        applyZoom();
    };

});