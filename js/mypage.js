document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    alert("로그인이 필요한 페이지입니다.");
    window.location.href = "login.html";
    return;
  }

  // 1. 기존 데이터 뿌려주기
  document.getElementById("myId").value = currentUser.id || "";
  document.getElementById("myName").value = currentUser.name || "";
  document.getElementById("myPhone").value = currentUser.phone || "";
  document.getElementById("myBirth").value = currentUser.birth || "";
  document.getElementById("myPosition").value = currentUser.position || "성도";
  document.getElementById("myGroup").value = currentUser.group || "미편성";
  document.getElementById("myAddress").value = currentUser.address || "";

  // 2. 정보 업데이트
  document.getElementById("mypageForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let users = JSON.parse(localStorage.getItem("churchUsers")) || [];
    const userIndex = users.findIndex((user) => user.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex].name = document.getElementById("myName").value;
      users[userIndex].phone = document.getElementById("myPhone").value;
      users[userIndex].birth = document.getElementById("myBirth").value;
      users[userIndex].address = document.getElementById("myAddress").value;

      const newPassword = document.getElementById("myPassword").value;
      if (newPassword) {
        users[userIndex].password = newPassword;
      }

      // 전체 저장소 업데이트 및 현재 내 상태 업데이트
      localStorage.setItem("churchUsers", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));

      alert("정보가 성공적으로 수정되었습니다.");
      window.location.reload();
    }
  });
});
