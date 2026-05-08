document.addEventListener("DOMContentLoaded", () => {
  // --- 1. 관리자 보안 검사 ---
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("관리자 및 교역자만 접근할 수 있는 페이지입니다.");
    window.location.href = "../index.html";
    return;
  }

  // 초기 데이터 로드 및 화면 렌더링
  renderMemberList();
  renderStatistics();
  renderGroups();
  renderNewFamily();

  // --- 2. 사이드바 메뉴 탭(Tab) 기능 ---
  const menuItems = document.querySelectorAll("#adminMenu li");
  const panels = document.querySelectorAll(".tab-panel");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 메뉴 색상 변경
      menuItems.forEach((m) => m.classList.remove("active"));
      item.classList.add("active");

      // 해당하는 패널(화면)만 보여주기
      const targetId = item.getAttribute("data-target");
      panels.forEach((panel) => {
        panel.classList.remove("active");
        if (panel.id === targetId) {
          panel.classList.add("active");
        }
      });
    });
  });
});

// --- 3. 회원 목록 렌더링 및 관리(수정/삭제) 버튼 생성 ---
function renderMemberList() {
  const tableBody = document.getElementById("memberData");
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
  tableBody.innerHTML = "";

  if (users.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; padding: 30px;">등록된 교인이 없습니다.</td></tr>';
    return;
  }

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    const roleLabel =
      user.role === "admin"
        ? '<span style="color:#ef4444; font-weight:bold;">관리자</span>'
        : "일반성도";

    row.innerHTML = `
            <td><strong>${user.name}</strong></td>
            <td>${user.position || "-"}</td>
            <td>${user.group || "-"}</td>
            <td>${user.phone || "-"}</td>
            <td>
                ${roleLabel} <br>
                <button class="btn-action btn-edit" onclick="editUser(${index})">수정</button>
                <button class="btn-action btn-delete" onclick="deleteUser(${index})">삭제</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// --- 4. 회원 정보 삭제 기능 ---
window.deleteUser = function (index) {
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
  const userName = users[index].name;

  if (confirm(`${userName} 성도님의 교적 정보를 정말 삭제하시겠습니까?`)) {
    users.splice(index, 1); // 배열에서 해당 회원 삭제
    localStorage.setItem("churchUsers", JSON.stringify(users));
    alert("삭제가 완료되었습니다.");
    renderMemberList(); // 화면 다시 그리기
    renderStatistics(); // 통계 다시 계산하기
  }
};

let currentEditIndex = -1; // 현재 수정 중인 회원의 번호 기억

// --- 5. 상세 정보 수정 카드(모달) 열기 ---
window.editUser = function (index) {
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
  let user = users[index];
  currentEditIndex = index; // 번호 저장

  // 모달창 안에 기존 데이터 채워넣기
  document.getElementById("modalTitle").innerText = `${user.name} 성도 상세 정보`;
  document.getElementById("editName").value = user.name || "";
  document.getElementById("editId").value = user.id || "";
  document.getElementById("editPhone").value = user.phone || "";
  document.getElementById("editBirth").value = user.birth || "";
  document.getElementById("editPosition").value = user.position || "성도";
  document.getElementById("editGroup").value = user.group || "미편성";
  document.getElementById("editAddress").value = user.address || "";

  // 관리자 전용 데이터
  document.getElementById("editStatus").value = user.status || "등록";
  document.getElementById("editMemo").value = user.memo || "";

  // 모달창 띄우기
  document.getElementById("editModal").style.display = "flex";
};

// --- 모달 닫기 ---
window.closeModal = function () {
  document.getElementById("editModal").style.display = "none";
};

// --- 수정한 정보 저장하기 ---
window.saveAdminEdit = function () {
  if (currentEditIndex === -1) return;

  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];

  // 입력된 값으로 업데이트
  users[currentEditIndex].name = document.getElementById("editName").value;
  users[currentEditIndex].phone = document.getElementById("editPhone").value;
  users[currentEditIndex].birth = document.getElementById("editBirth").value;
  users[currentEditIndex].position = document.getElementById("editPosition").value;
  users[currentEditIndex].group = document.getElementById("editGroup").value;
  users[currentEditIndex].address = document.getElementById("editAddress").value;
  users[currentEditIndex].status = document.getElementById("editStatus").value;
  users[currentEditIndex].memo = document.getElementById("editMemo").value;

  localStorage.setItem("churchUsers", JSON.stringify(users));

  alert("성도 정보가 성공적으로 수정되었습니다.");
  closeModal();
  renderMemberList(); // 표 다시 그리기
  renderStatistics();
  renderGroups();
};

// --- 비밀번호 강제 초기화 ---
window.resetUserPassword = function () {
  if (currentEditIndex === -1) return;
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
  const user = users[currentEditIndex];

  if (confirm(`[${user.name}] 성도님의 비밀번호를 '1234'로 초기화하시겠습니까?`)) {
    users[currentEditIndex].password = "1234";
    localStorage.setItem("churchUsers", JSON.stringify(users));
    alert("비밀번호가 초기화되었습니다. 성도님께 안내해 주세요.");
  }

  // 최종 저장 및 화면 새로고침
  localStorage.setItem("churchUsers", JSON.stringify(users));
  alert("정보가 성공적으로 업데이트 되었습니다.");
  renderMemberList();
};

// 회원 목록 그릴 때 상태(Status)도 함께 보여주도록 renderMemberList 함수도 살짝 고쳐줍니다.
function renderMemberList() {
  const tableBody = document.getElementById("memberData");
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
  tableBody.innerHTML = "";

  if (users.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center; padding: 30px;">등록된 교인이 없습니다.</td></tr>';
    return;
  }

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    const roleLabel =
      user.role === "admin"
        ? '<span style="color:#ef4444;font-weight:bold;">관리자</span>'
        : "성도";

    // 상태값에 따른 색상 라벨
    let statusColor = "#10b981"; // 등록(초록)
    if (user.status === "휴적") statusColor = "#f59e0b"; // 노랑
    if (user.status === "이명" || user.status === "사망") statusColor = "#94a3b8"; // 회색

    row.innerHTML = `
            <td><strong>${user.name}</strong> <br><span style="font-size:0.8rem; color:#64748b;">(${user.id})</span></td>
            <td>${user.position || "-"}</td>
            <td>${user.group || "-"}</td>
            <td>${user.phone || "-"}</td>
            <td><span style="background:${statusColor}; color:white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${user.status || "등록"}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editUser(${index})">상세/수정</button>
                <button class="btn-action btn-delete" onclick="deleteUser(${index})">삭제</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// --- 6. 실시간 통계 계산 기능 ---
function renderStatistics() {
  const statsContainer = document.getElementById("statsContainer");
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const newFamilyCount = users.filter((u) => u.group === "새가족부").length;

  statsContainer.innerHTML = `
        <div class="stat-card">
            <h4>총 등록 성도</h4>
            <p>${totalUsers}명</p>
        </div>
        <div class="stat-card">
            <h4>새가족부</h4>
            <p>${newFamilyCount}명</p>
        </div>
        <div class="stat-card">
            <h4>관리자/교역자</h4>
            <p>${adminCount}명</p>
        </div>
    `;
}

// --- 7. 구역/셀 편성 카드 렌더링 기능 ---
function renderGroups() {
  const groupContainer = document.getElementById("groupContainer");
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];

  const groups = ["새가족부", "1교구", "2교구", "청년부", "주일학교", "미편성"];
  let html = "";

  groups.forEach((groupName) => {
    // ⭐️ 이 부분을 아래처럼 수정해 주세요!
    const members = users.filter((u) => {
      if (groupName === "미편성") {
        // 값이 아예 없거나(''), 진짜로 '미편성'이라고 적혀있는 사람을 모두 찾습니다.
        return !u.group || u.group === "" || u.group === "미편성";
      }
      return u.group === groupName;
    });
    // ⭐️ 수정 끝

    // 카드 상단 (구역 이름과 인원수)
    html += `
            <div class="group-card">
                <h3>${groupName} <span style="font-size: 0.9rem; color: #64748b; font-weight: normal;">총 ${members.length}명</span></h3>
                <ul class="group-list">
        `;

    // 카드 내부 (성도 목록)
    if (members.length === 0) {
      html += `<li style="color: #94a3b8; justify-content: center; padding: 20px 0;">소속된 인원이 없습니다.</li>`;
    } else {
      members.forEach((member) => {
        // 전체 배열에서 이 사람의 진짜 인덱스(번호)를 찾습니다.
        const originalIndex = users.findIndex((u) => u.email === member.email);

        html += `
                    <li>
                        <div class="member-info">
                            <strong>${member.name}</strong>
                            <span style="font-size: 0.85rem; color: #64748b;">${member.position || "성도"}</span>
                        </div>
                        <select class="group-select" onchange="changeUserGroup(${originalIndex}, this.value)">
                            <option value="새가족부" ${member.group === "새가족부" ? "selected" : ""}>새가족부</option>
                            <option value="1교구" ${member.group === "1교구" ? "selected" : ""}>1교구</option>
                            <option value="2교구" ${member.group === "2교구" ? "selected" : ""}>2교구</option>
                            <option value="청년부" ${member.group === "청년부" ? "selected" : ""}>청년부</option>
                            <option value="주일학교" ${member.group === "주일학교" ? "selected" : ""}>주일학교</option>
                            <option value="" ${!member.group ? "selected" : ""}>미편성</option>
                        </select>
                    </li>
                `;
      });
    }

    html += `</ul></div>`;
  });

  groupContainer.innerHTML = html;
}

// --- 8. 소속 즉시 변경 기능 ---
window.changeUserGroup = function (index, newGroup) {
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
  const userName = users[index].name;

  users[index].group = newGroup; // 새 소속으로 변경
  localStorage.setItem("churchUsers", JSON.stringify(users));

  alert(`${userName} 성도님의 소속이 변경되었습니다.`);
};

// --- 9. 새 가족 관리 패널 렌더링 기능 ---
function renderNewFamily() {
  const tbody = document.getElementById("newFamilyData");
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];

  // 전체 회원 중에서 group(소속)이 '새가족부'인 사람만 필터링합니다.
  const newMembers = users.filter((user) => user.group === "새가족부");
  tbody.innerHTML = ""; // 표 안을 깨끗하게 비우기

  if (newMembers.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center; padding: 30px; color:#64748b;">현재 관리 중인 새 가족이 없습니다.</td></tr>';
    return;
  }

  newMembers.forEach((member) => {
    // 전체 명부에서 이 사람의 고유 번호(인덱스)를 찾아냅니다.
    const originalIndex = users.findIndex((u) => u.email === member.email);
    const registerDate = member.registerDate || "정보 없음";

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>
                <strong>${member.name}</strong> 
                <span style="font-size: 0.8rem; color: #10b981; background: #d1fae5; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">새가족</span>
            </td>
            <td>${member.phone || "-"}</td>
            <td>${registerDate}</td>
            <td>
                <button class="btn-action" onclick="graduateNewFamily(${originalIndex})" style="background-color: #10b981; padding: 8px 15px; font-weight: bold;">교육 수료 및 등반 처리</button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

// --- 10. 새 가족 등반(정규 구역 편성) 처리 기능 ---
window.graduateNewFamily = function (index) {
  let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
  const user = users[index];

  // 관리자에게 알림창을 띄워 어느 구역으로 보낼지 입력받습니다.
  const newGroup = prompt(
    `[${user.name}] 성도님의 새 가족 교육이 수료되었습니까?\n등반(편성)시킬 구역 이름(예: 1교구, 2교구, 청년부 등)을 정확히 입력해주세요.`,
    "1교구",
  );

  // 관리자가 구역을 입력하고 '확인'을 눌렀다면 작동합니다.
  if (newGroup !== null && newGroup.trim() !== "") {
    users[index].group = newGroup.trim(); // 입력한 구역으로 정보 수정
    localStorage.setItem("churchUsers", JSON.stringify(users)); // 저장소에 업데이트

    alert(`${user.name} 성도님이 '${newGroup}'(으)로 등반 되었습니다!`);

    // 정보가 바뀌었으므로, 대시보드의 모든 화면(4군데)을 다시 새롭게 그려줍니다.
    renderMemberList();
    renderStatistics();
    renderGroups();
    renderNewFamily();
  }
};
// --- 11. 관리자: 성도 직접 등록 폼 제출 기능 ---
document.addEventListener("DOMContentLoaded", () => {
  // 오늘 날짜를 '등록일자' 칸에 기본으로 세팅해줍니다.
  const regDateInput = document.getElementById("regDate");
  if (regDateInput) {
    regDateInput.value = new Date().toISOString().split("T")[0];
  }

  const adminRegisterForm = document.getElementById("adminRegisterForm");
  if (adminRegisterForm) {
    adminRegisterForm.addEventListener("submit", function (e) {
      e.preventDefault(); // 새로고침 방지

      const newId = document.getElementById("regId").value;
      let users = JSON.parse(localStorage.getItem("churchUsers")) || [];

      // 1. 아이디 중복 검사
      if (users.find((user) => user.id === newId)) {
        alert("이미 사용 중인 아이디입니다. 다른 아이디를 부여해 주세요.");
        return;
      }

      // 2. 입력 데이터 모으기
      const newMember = {
        id: newId,
        password: document.getElementById("regPassword").value,
        name: document.getElementById("regName").value,
        gender: document.getElementById("regGender").value,
        phone: document.getElementById("regPhone").value,
        birth: document.getElementById("regBirth").value,
        position: document.getElementById("regPosition").value,
        group: document.getElementById("regGroup").value,
        status: document.getElementById("regStatus").value,
        registerDate: document.getElementById("regDate").value,
        address: document.getElementById("regAddress").value,
        memo: document.getElementById("regMemo").value,
        // 관리자 등록 기능이므로 일반 회원(member) 권한을 기본으로 부여
        role: newId.includes("admin") ? "admin" : "member",
      };

      // 3. 로컬 스토리지에 추가
      users.push(newMember);
      localStorage.setItem("churchUsers", JSON.stringify(users));

      alert(`[${newMember.name}] 성도님의 교적 등록이 완료되었습니다.`);

      // 4. 입력 폼 초기화
      adminRegisterForm.reset();
      regDateInput.value = new Date().toISOString().split("T")[0]; // 날짜는 다시 오늘로 리셋

      // 5. 화면 갱신 및 '전체 교인 목록' 탭으로 강제 이동하여 확인시켜주기
      renderMemberList();
      renderStatistics();
      renderGroups();
      renderNewFamily();

      // 사이드바 메뉴의 '전체 교인 목록' 클릭 이벤트를 강제로 발생시켜 화면을 넘깁니다.
      document.querySelector('#adminMenu li[data-target="panel-list"]').click();
    });
  }
});
