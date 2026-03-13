const projectList = document.getElementById("projectList");
const slider = document.getElementById("slider");
const viewerTitle = document.getElementById("viewerTitle");
const pageIndicator = document.getElementById("pageIndicator");

let currentPage = 1;
let totalPages = 0;
let pageWidth = 0;

fetch("project-list.json")
    .then(res => res.json())
    .then(projects => {

        projects.forEach((project, index) => {

            const btn = document.createElement("div");
            btn.className = "pdf-btn";
            btn.textContent = project.title;

            btn.onclick = () => {

                // active 버튼 갱신
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

    const images = await loadImages(project.path);

    totalPages = images.length;
    currentPage = 1;

    images.forEach(src => {

        const pageDiv = document.createElement("div");
        pageDiv.className = "page";

        const img = document.createElement("img");
        img.src = src;

        pageDiv.appendChild(img);
        slider.appendChild(pageDiv);

    });

    pageWidth = slider.clientWidth;

    updatePageIndicator();
}


async function loadImages(path) {

    const images = [];

    for (let i = 1; i <= 300; i++) {

        const num = String(i).padStart(3, "0");
        const file = `${path}/${num}.jpg`;

        const exists = await imageExists(file);

        if (!exists) break;

        images.push(file);
    }

    return images;
}


function imageExists(url) {

    return new Promise(resolve => {

        const img = new Image();

        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);

        img.src = url;

    });
}


function updatePageIndicator() {

    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
}


document.getElementById("nextBtn").onclick = () => {

    if (currentPage >= totalPages) return;

    slider.scrollBy({
        left: pageWidth,
        behavior: "smooth"
    });

    currentPage++;
    updatePageIndicator();
};


document.getElementById("prevBtn").onclick = () => {

    if (currentPage <= 1) return;

    slider.scrollBy({
        left: -pageWidth,
        behavior: "smooth"
    });

    currentPage--;
    updatePageIndicator();
};