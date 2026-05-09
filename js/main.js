document.addEventListener("DOMContentLoaded", () => {
  // 현재 페이지 위치에 따라 상대 경로의 기준(basePath)을 설정합니다.
  // /pages/ 안에 있으면 ../, 루트에 있으면 ./ 가 됩니다.
  const basePath = window.location.pathname.includes("/pages/") ? "../" : "./";

  // 1. 공통 네비게이션 바 불러오기
  fetch(basePath + "components/nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("nav-placeholder").innerHTML = data;

      // 2. [추가] 네비게이션 내의 모든 링크 경로 교정
      // nav.html에 작성된 "../" 경로들을 현재 페이지의 basePath에 맞춰 변경합니다.
      const navLinks = document.querySelectorAll("#navMenu a, .logo");
      navLinks.forEach((link) => {
        const currentHref = link.getAttribute("href");
        if (currentHref && currentHref !== "#") {
          // 기존 경로에서 "../"를 제거하고 현재 위치에 맞는 basePath를 붙여줍니다.
          const cleanPath = currentHref.replace("../", "");
          link.setAttribute("href", basePath + cleanPath);
        }
      });

      // 3. 메뉴가 그려진 후 이벤트와 로그인 상태 세팅
      initNavigation(basePath);
    })
    .catch((error) => console.error("네비게이션 로드 실패:", error));
});

function initNavigation(basePath) {
  // --- 햄버거 메뉴 동작 ---
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // --- 로그인 상태 확인 및 UI 변경 ---
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
