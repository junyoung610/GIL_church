document.addEventListener("DOMContentLoaded", () => {
  // 현재 페이지가 pages 폴더 안에 있는지 확인하여 상대 경로를 자동 설정합니다.
  const basePath = window.location.pathname.includes("/pages/") ? "../" : "./";

  // 공통 네비게이션 바 불러오기
  fetch(basePath + "components/nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("nav-placeholder").innerHTML = data;

      // 메뉴가 화면에 그려진 후, 이벤트와 로그인 상태를 세팅합니다.
      initNavigation(basePath);
    })
    .catch((error) => console.error("네비게이션을 불러오는데 실패했습니다:", error));
});

function initNavigation(basePath) {
  // --- 1. 햄버거 메뉴 동작 로직 ---
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // --- 2. 로그인 상태 확인 및 로그아웃 처리 로직 ---
  const authMenuArea = document.getElementById("authMenuArea");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (authMenuArea) {
    if (currentUser) {
      // [로그인 된 상태] 이름, 마이페이지, 로그아웃 표시 (main.js 안의 authMenuArea 부분)
      authMenuArea.innerHTML = `
    <span style="color: #cbd5e1; font-weight: bold; margin-right: 15px; padding: 10px 0;">
        ${currentUser.name}님
    </span>
    <a href="${basePath}pages/mypage.html" style="margin-right: 15px;">마이페이지</a>
    <a href="#" id="logoutBtn" style="display: inline-block;">로그아웃</a>
`;

      // 로그아웃 버튼을 눌렀을 때의 동작
      document.getElementById("logoutBtn").addEventListener("click", (e) => {
        e.preventDefault(); // 링크 이동 방지
        localStorage.removeItem("currentUser"); // 저장소에서 사용자 정보 삭제
        alert("안전하게 로그아웃 되었습니다.");
        window.location.href = basePath + "index.html"; // 메인 홈페이지로 이동
      });
    } else {
      // [로그아웃 상태] 로그인 페이지로 가는 링크 표시
      authMenuArea.innerHTML = `<a href="${basePath}pages/login.html">로그인/회원가입</a>`;
    }
  }
}
