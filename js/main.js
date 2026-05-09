// 1. 필요한 Firebase 도구 및 설정 불러오기 (반드시 최상단에 위치)
import { db } from "./firebase-config.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // 현재 페이지 위치에 따라 상대 경로의 기준(basePath)을 설정
  // /pages/ 안에 있으면 ../, 루트에 있으면 ./ 가 됩니다.
  const basePath = window.location.pathname.includes("/pages/") ? "../" : "./";

  // 2. 공통 네비게이션 바 불러오기
  fetch(basePath + "components/nav.html")
    .then((response) => response.text())
    .then((data) => {
      const navPlaceholder = document.getElementById("nav-placeholder");
      if (navPlaceholder) {
        navPlaceholder.innerHTML = data;

        // 3. 네비게이션 내의 모든 링크 경로 교정
        // nav.html에 작성된 "../" 경로들을 현재 페이지 위치에 맞춰 자동으로 변경합니다.
        const navLinks = document.querySelectorAll("#navMenu a, .logo");
        navLinks.forEach((link) => {
          const currentHref = link.getAttribute("href");
          if (currentHref && currentHref !== "#") {
            const cleanPath = currentHref.replace("../", "");
            link.setAttribute("href", basePath + cleanPath);
          }
        });

        // 4. 메뉴가 화면에 그려진 후 이벤트와 로그인 상태 세팅
        initNavigation(basePath);
      }
    })
    .catch((error) => console.error("네비게이션 로드 실패:", error));

  // 5. 메인 페이지 전용: 최신 소식 로드 함수 실행
  loadMainRecentPosts();
});

/**
 * 네비게이션 초기화 및 로그인 상태 UI 변경 함수
 */
function initNavigation(basePath) {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");

  // 햄버거 메뉴 동작
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // 로그인 상태 확인 및 상단 메뉴(마이페이지/로그아웃) UI 변경
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
        alert("로그아웃 되었습니다.");
        window.location.href = basePath + "index.html";
      });
    } else {
      authMenuArea.innerHTML = `<a href="${basePath}pages/login.html">로그인/회원가입</a>`;
    }
  }
}

/**
 * 메인 페이지(index.html)에서 최신 게시글 5개를 불러오는 함수
 */
async function loadMainRecentPosts() {
  const newsContainer = document.getElementById("mainRecentPosts");
  if (!newsContainer) return; // 메인 페이지가 아니면 중단

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
