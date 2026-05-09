import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 현재 수정 중인 성도님의 UID를 기억하기 위한 변수
let currentEditUid = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. 관리자 보안 검사 (기존 로그인 정보 활용)
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("관리자만 접근할 수 있는 페이지입니다.");
    window.location.href = "../index.html";
    return;
  }

  // 2. 초기 데이터 로드 (서버에서 명단 가져오기)
  await refreshAdminData();

  // 3. 사이드바 메뉴 탭 기능 설정
  setupAdminTabs();
});

// --- [공통] 데이터 새로고침 함수 ---
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
    console.error("데이터 로드 실패:", error);
  }
}

// --- [기능 1] 회원 목록 출력 ---
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

// --- [기능 2] 수정 모달 열기 (Firebase 데이터 로드) ---
window.openEditModal = async function (uid) {
  currentEditUid = uid; // 수정할 대상의 ID 저장
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const user = userDoc.data();

      // HTML의 모달 입력 칸들에 데이터 채워넣기
      document.getElementById("editName").value = user.name || "";
      document.getElementById("editId").value = user.id || "";
      document.getElementById("editPhone").value = user.phone || "";
      document.getElementById("editBirth").value = user.birth || "";
      document.getElementById("editPosition").value = user.position || "성도";
      document.getElementById("editGroup").value = user.group || "미편성";
      document.getElementById("editStatus").value = user.status || "등록";
      document.getElementById("editMemo").value = user.memo || "";
      document.getElementById("editAddress").value = user.address || "";

      // 모달창 띄우기
      document.getElementById("editModal").style.display = "flex";
    }
  } catch (error) {
    alert("정보를 불러오지 못했습니다.");
  }
};

// --- [기능 3] 수정 내용 저장하기 (Firebase updateDoc) ---
window.saveAdminEdit = async function () {
  if (!currentEditUid) return;

  // 입력된 최신 정보 모으기
  const updatedData = {
    name: document.getElementById("editName").value,
    phone: document.getElementById("editPhone").value,
    birth: document.getElementById("editBirth").value,
    position: document.getElementById("editPosition").value,
    group: document.getElementById("editGroup").value,
    status: document.getElementById("editStatus").value,
    memo: document.getElementById("editMemo").value,
    address: document.getElementById("editAddress").value,
  };

  try {
    // Firebase 서버 업데이트
    await updateDoc(doc(db, "users", currentEditUid), updatedData);
    alert("성공적으로 수정되었습니다.");
    closeModal(); // 모달 닫기
    await refreshAdminData(); // 목록 새로고침
  } catch (error) {
    console.error("수정 오류:", error);
    alert("수정 중 오류가 발생했습니다. 권한을 확인해주세요.");
  }
};

// --- [기능 4] 회원 삭제 기능 ---
window.deleteUser = async function (uid, name) {
  if (confirm(`${name} 성도님의 정보를 정말 삭제하시겠습니까?`)) {
    try {
      await deleteDoc(doc(db, "users", uid));
      alert("삭제되었습니다.");
      await refreshAdminData();
    } catch (error) {
      alert("삭제 권한이 없거나 오류가 발생했습니다.");
    }
  }
};

// --- [기능 5] 모달 닫기 ---
window.closeModal = function () {
  document.getElementById("editModal").style.display = "none";
  currentEditUid = null;
};

// --- [기능 6] 탭 메뉴 설정 ---
function setupAdminTabs() {
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
}

// --- [기능 7] 통계 및 구역 데이터 렌더링 ---
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
