import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const basePath = window.location.pathname.includes("/pages/") ? "../" : "./";

  // 1. 공통 컴포넌트 로드
  loadComponent(basePath + "components/nav.html", "nav-placeholder", basePath);
  loadComponent(basePath + "components/footer.html", "footer-placeholder", basePath);

  // 2. 메인 페이지 전용 데이터 로드
  loadMainRecentPosts();
  loadLatestSermon();
});

/**
 * 컴포넌트 로드 및 경로 교정
 */
function loadComponent(url, placeholderId, basePath) {
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      const placeholder = document.getElementById(placeholderId);
      if (placeholder) {
        placeholder.innerHTML = data;
        const links = placeholder.querySelectorAll("a");
        links.forEach((link) => {
          const currentHref = link.getAttribute("href");
          if (currentHref && currentHref !== "#") {
            link.setAttribute("href", basePath + currentHref.replace("../", ""));
          }
        });
        const images = placeholder.querySelectorAll("img");
        images.forEach((img) => {
          const currentSrc = img.getAttribute("src");
          if (currentSrc && currentSrc.startsWith("../")) {
            img.setAttribute("src", basePath + currentSrc.replace("../", ""));
          }
        });
        if (placeholderId === "nav-placeholder") initNavigation(basePath);
      }
    })
    .catch((error) => console.error(`${placeholderId} 로드 실패:`, error));
}

function initNavigation(basePath) {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  const authMenuArea = document.getElementById("authMenuArea");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (authMenuArea) {
    if (currentUser) {
      authMenuArea.innerHTML = `
        <span style="color: #000; font-weight: bold; margin-right: 15px;">${currentUser.name}님</span>
        <a href="${basePath}pages/mypage.html" style="margin-right: 15px;">마이페이지</a>
        <a href="#" id="logoutBtn">로그아웃</a>
      `;
      document.getElementById("logoutBtn").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = basePath + "index.html";
      });
    } else {
      authMenuArea.innerHTML = `<a href="${basePath}pages/login.html">로그인/회원가입</a>`;
    }
  }
}

/**
 * 메인 페이지 최신 소식 (공지사항 등)
 */
async function loadMainRecentPosts() {
  const newsContainer = document.getElementById("mainRecentPosts");
  if (!newsContainer) return;
  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    newsContainer.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const post = doc.data();
      newsContainer.innerHTML += `
        <li><a href="./pages/board_detail.html?id=${doc.id}">
          <span>${post.title}</span>
          <span style="color: #94a3b8; font-size: 0.85rem;">${post.date.split("T")[0]}</span>
        </a></li>`;
    });
  } catch (error) {
    console.error("소식 로드 실패:", error);
  }
}

/**
 * [핵심] 주일설교 게시판에서 가장 최신 영상 1개를 가져와 임베드
 */
async function loadLatestSermon() {
  const videoArea = document.getElementById("latestSermonVideo");
  if (!videoArea) return;

  try {
    const q = query(
      collection(db, "posts"),
      where("type", "==", "sermon"),
      orderBy("date", "desc"),
      limit(1),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const latestPost = querySnapshot.docs[0].data();
      if (latestPost.videoId) {
        videoArea.innerHTML = `
          <iframe src="https://www.youtube.com/embed/${latestPost.videoId}" 
            title="최신 설교 영상" allowfullscreen frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>`;
        return;
      }
    }
    videoArea.innerHTML = '<p class="loading">등록된 최신 설교 영상이 없습니다.</p>';
  } catch (error) {
    console.error("영상 로드 실패:", error);
    videoArea.innerHTML = '<p class="loading">영상을 불러오는 중 오류가 발생했습니다.</p>';
  }
}
