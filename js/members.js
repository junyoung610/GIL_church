import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. 관리자 보안 검사 (기존 로그인 정보 활용)
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("관리자만 접근할 수 있습니다.");
    window.location.href = "../index.html";
    return;
  }

  // 2. 초기 데이터 로드
  await refreshAdminData();

  // 3. 사이드바 메뉴 탭 기능
  const menuItems = document.querySelectorAll("#adminMenu li");
  const panels = document.querySelectorAll(".tab-panel");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((m) => m.classList.remove("active"));
      item.classList.add("active");
      const targetId = item.getAttribute("data-target");
      panels.forEach((panel) => {
        panel.classList.remove("active");
        if (panel.id === targetId) panel.classList.add("active");
      });
    });
  });
});

// 모든 데이터를 한 번에 새로고침하는 함수
async function refreshAdminData() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() });
    });

    renderMemberList(users);
    renderStatistics(users);
    renderGroups(users);
    renderNewFamily(users);
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
  }
}

// --- 회원 목록 렌더링 ---
function renderMemberList(users) {
  const tableBody = document.getElementById("memberData");
  tableBody.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");
    const statusColor =
      user.status === "휴적" ? "#f59e0b" : user.status === "등록" ? "#10b981" : "#94a3b8";

    row.innerHTML = `
            <td><strong>${user.name}</strong> <br><span style="font-size:0.8rem; color:#64748b;">(${user.id || "ID없음"})</span></td>
            <td>${user.position || "-"}</td>
            <td>${user.group || "-"}</td>
            <td>${user.phone || "-"}</td>
            <td><span style="background:${statusColor}; color:white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${user.status || "등록"}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="openEditModal('${user.uid}')">상세/수정</button>
                <button class="btn-action btn-delete" onclick="deleteUser('${user.uid}', '${user.name}')">삭제</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// --- 전역 함수 등록 (HTML onclick 대응) ---
window.deleteUser = async function (uid, name) {
  if (confirm(`${name} 성도님의 정보를 삭제하시겠습니까?`)) {
    await deleteDoc(doc(db, "users", uid));
    alert("삭제되었습니다.");
    refreshAdminData();
  }
};

window.openEditModal = async function (uid) {
  // 상세 수정 모달 로직 (필요 시 구현)
  alert("상세 수정 기능은 Firebase updateDoc으로 연동이 필요합니다.");
};

// --- 통계 및 구역 관리 ---
function renderStatistics(users) {
  const statsContainer = document.getElementById("statsContainer");
  statsContainer.innerHTML = `
        <div class="stat-card"><h4>총 등록 성도</h4><p>${users.length}명</p></div>
        <div class="stat-card"><h4>새가족부</h4><p>${users.filter((u) => u.group === "새가족부").length}명</p></div>
        <div class="stat-card"><h4>관리자/교역자</h4><p>${users.filter((u) => u.role === "admin").length}명</p></div>
    `;
}

function renderGroups(users) {
  const groupContainer = document.getElementById("groupContainer");
  const groups = ["새가족부", "1교구", "2교구", "청년부", "주일학교", "미편성"];
  groupContainer.innerHTML = "";

  groups.forEach((groupName) => {
    const members = users.filter((u) =>
      groupName === "미편성" ? !u.group || u.group === "미편성" : u.group === groupName,
    );
    const card = document.createElement("div");
    card.className = "group-card";
    card.innerHTML = `<h3>${groupName} <span>${members.length}명</span></h3><ul class="group-list"></ul>`;

    const list = card.querySelector(".group-list");
    members.forEach((m) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${m.name}</strong> <span>${m.position || "성도"}</span>`;
      list.appendChild(li);
    });
    groupContainer.appendChild(card);
  });
}

function renderNewFamily(users) {
  const tbody = document.getElementById("newFamilyData");
  const newMembers = users.filter((u) => u.group === "새가족부");
  tbody.innerHTML = "";
  newMembers.forEach((m) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong>${m.name}</strong></td><td>${m.phone}</td><td>${m.registerDate?.split("T")[0] || "-"}</td><td>관리중</td>`;
    tbody.appendChild(row);
  });
}
