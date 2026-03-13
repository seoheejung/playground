document.addEventListener("DOMContentLoaded", () => {

const projectList = document.getElementById("projectList");
const slider = document.getElementById("slider");
const viewerTitle = document.getElementById("viewerTitle");
const pageIndicator = document.getElementById("pageIndicator");

let currentPage = 1;
let totalPages = 0;
let pageWidth = 0;
let images = [];

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

            if (index === 0) {
                btn.classList.add("active");
                loadProject(project);
            }

        });

    });

async function loadProject(project) {

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

    const img = document.createElement("img");

    img.loading = "lazy";
    img.src = src;

    img.onerror = () => {
        pageDiv.innerHTML = "<div style='color:#aaa;padding:40px'>Image load failed</div>";
    };

    pageDiv.appendChild(img);
    slider.appendChild(pageDiv);
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

});