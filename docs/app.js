document.addEventListener("DOMContentLoaded", () => {

    const projectList = document.getElementById("projectList");
    const slider = document.getElementById("slider");
    const viewerTitle = document.getElementById("viewerTitle");
    const pageIndicator = document.getElementById("pageIndicator");

    let currentPage = 1;
    let totalPages = 0;
    let pageWidth = 0;
    let images = [];
    let zoomLevel = 1;

    fetch("project-list.json", { cache: "no-store" })
        .then(res => res.json())
        .then(projects => {

            projects.forEach((project, index) => {

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

    async function loadProject(project) {
        document.body.classList.add("viewer-active");
        slider.innerHTML = "";
        viewerTitle.textContent = project.title;

        images = loadImages(project.path, project.pages);

        totalPages = images.length;
        currentPage = 1;

        renderPage();

        pageWidth = slider.clientWidth;

        updatePageIndicator();
    }

    function loadImages(path, pages) {

        const images = [];
        const cacheBuster = Date.now();

        for (let i = 1; i <= pages; i++) {

            const num = String(i).padStart(3, "0");

            images.push(`${path}/${num}.jpg?v=${cacheBuster}`);
        }

        return images;
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

        const loader = document.createElement("div");
        loader.className = "loader";

        pageDiv.appendChild(loader);
        slider.appendChild(pageDiv);

        const img = new Image();
        img.src = src;

        img.style.transform = `scale(${zoomLevel})`;
        img.style.transformOrigin = "center";

        img.onload = () => {
            pageDiv.innerHTML = "";
            pageDiv.appendChild(img);
        };

        img.onerror = () => {
            pageDiv.innerHTML =
                "<div style='color:#aaa;padding:40px'>Image load failed</div>";
        };

        /* 다음 페이지 프리로드 */
        const next = images[currentPage];
        if (next) {
            const preload = new Image();
            preload.src = next;
        }
    }

    function updatePageIndicator() {
        pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    }

    document.getElementById("nextBtn").onclick = () => {

        if (currentPage >= totalPages) return;

        currentPage++;
        renderPage();
        updatePageIndicator();
    };

    document.getElementById("prevBtn").onclick = () => {

        if (currentPage <= 1) return;

        currentPage--;
        renderPage();
        updatePageIndicator();
    };

    document.addEventListener("keydown", (e) => {

        if (["ArrowLeft","ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === "ArrowRight") {
            document.getElementById("nextBtn").click();
        }

        if (e.key === "ArrowLeft") {
            document.getElementById("prevBtn").click();
        }

    });

    slider.addEventListener("wheel", (e) => {

        if (e.deltaY > 0) {
            document.getElementById("nextBtn").click();
        } else {
            document.getElementById("prevBtn").click();
        }

    });

    document.getElementById("zoomIn").onclick = () => {

        zoomLevel += 0.1;

        const img = document.querySelector(".page img");

        if(img){
            img.style.transform = `scale(${zoomLevel})`;
        }
    };

    document.getElementById("zoomOut").onclick = () => {

        zoomLevel = Math.max(0.5, zoomLevel - 0.1);

        const img = document.querySelector(".page img");

        if(img){
            img.style.transform = `scale(${zoomLevel})`;
        }
    };

});