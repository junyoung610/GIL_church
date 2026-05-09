import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const basePath = window.location.pathname.includes("/pages/") ? "../" : "./";

  // 1. 네비게이션 로드
  loadComponent(basePath + "components/nav.html", "nav-placeholder", basePath);

  // 2. 푸터 로드 (추가된 부분)
  loadComponent(basePath + "components/footer.html", "footer-placeholder", basePath);

  // 3. 메인 페이지 전용: 최신 소식 로드
  loadMainRecentPosts();
});

/**
 * 공통 컴포넌트(HTML)를 불러와서 특정 위치에 넣고 경로를 교정하는 함수
 */
function loadComponent(url, placeholderId, basePath) {
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      const placeholder = document.getElementById(placeholderId);
      if (placeholder) {
        placeholder.innerHTML = data;

        // 링크 경로 교정 (../ 로 시작하는 경로들을 basePath에 맞춰 변경)
        const links = placeholder.querySelectorAll("a");
        links.forEach((link) => {
          const currentHref = link.getAttribute("href");
          if (currentHref && currentHref !== "#") {
            const cleanPath = currentHref.replace("../", "");
            link.setAttribute("href", basePath + cleanPath);
          }
        });

        // 네비게이션인 경우 로그인 상태 세팅 함수 실행
        if (placeholderId === "nav-placeholder") {
          initNavigation(basePath);
        }
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
        <span style="color: #cbd5e1; font-weight: bold; margin-right: 15px;">
            ${currentUser.name}님
        </span>
        <a href="${basePath}pages/mypage.html" style="margin-right: 15px;">마이페이지</a>
        <a href="#" id="logoutBtn">로그아웃</a>
      `;

      document.getElementById("logoutBtn").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        alert("안전하게 로그아웃 되었습니다.");
        window.location.href = basePath + "index.html";
      });
    } else {
      authMenuArea.innerHTML = `<a href="${basePath}pages/login.html">로그인/회원가입</a>`;
    }
  }
}

async function loadMainRecentPosts() {
  const newsContainer = document.getElementById("mainRecentPosts");
  if (!newsContainer) return;

  try {
    const q = query(collection(db, "posts"), orderBy("date", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    newsContainer.innerHTML = "";
    if (querySnapshot.empty) {
      newsContainer.innerHTML = "<li>등록된 소식이 없습니다.</li>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const post = doc.data();
      const date = post.date ? post.date.split("T")[0] : "-";

      newsContainer.innerHTML += `
        <li>
            <a href="./pages/board_detail.html?id=${doc.id}">
                <span>${post.title}</span>
                <span style="color: #94a3b8; font-size: 0.85rem;">${date}</span>
            </a>
        </li>
      `;
    });
  } catch (error) {
    console.error("메인 소식 로드 실패:", error);
  }
}
// js/main.js 파일에 추가 (loadMainRecentPosts 근처에 배치)
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadLatestSermon() {
  const videoArea = document.getElementById("latestSermonVideo");
  if (!videoArea) return;

  try {
    // 1. Firestore의 'settings/mainPage' 문서에서 영상 ID를 가져옵니다.
    // (미리 Firestore에 데이터를 생성해두어야 합니다. 예: { latestVideoId: "유튜브_영상_ID" })
    const docRef = doc(db, "settings", "mainPage");
    const docSnap = await getDoc(docRef);

    let videoId = "X7R-q9knSbs"; // [기본값] 데이터가 없을 때 보여줄 예시 영상 ID

    if (docSnap.exists()) {
      videoId = docSnap.data().latestVideoId;
    }

    // 2. 유튜브 iframe 생성 및 삽입
    videoArea.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}" 
                title="최신 설교 영상" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>
        `;
  } catch (error) {
    console.error("영상 로드 실패:", error);
    videoArea.innerHTML = '<p class="loading">영상을 불러올 수 없습니다.</p>';
  }
}

// 초기 실행 함수(DOMContentLoaded) 안에서 호출하도록 추가하세요.
loadLatestSermon();
