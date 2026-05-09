import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const mypageForm = document.getElementById("mypageForm");

  // 1. 로그인 상태 확인 및 기존 데이터 불러오기
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("로그인이 필요한 페이지입니다.");
      window.location.href = "login.html";
      return;
    }

    try {
      // Firestore에서 현재 사용자의 상세 정보 가져오기
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // 화면의 입력창에 데이터 채워넣기
        document.getElementById("myId").value = userData.id || "";
        document.getElementById("myName").value = userData.name || "";
        document.getElementById("myPhone").value = userData.phone || "";
        document.getElementById("myBirth").value = userData.birth || "";
        document.getElementById("myPosition").value = userData.position || "성도";
        document.getElementById("myGroup").value = userData.group || "미편성";
        document.getElementById("myAddress").value = userData.address || "";
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  });

  // 2. 정보 업데이트 처리
  if (mypageForm) {
    mypageForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return;

      const newName = document.getElementById("myName").value;
      const newPhone = document.getElementById("myPhone").value;
      const newBirth = document.getElementById("myBirth").value;
      const newAddress = document.getElementById("myAddress").value;
      const newPassword = document.getElementById("myPassword").value;

      try {
        // (1) Firestore 데이터 업데이트
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          name: newName,
          phone: newPhone,
          birth: newBirth,
          address: newAddress,
        });

        // (2) 비밀번호 변경 (입력값이 있을 때만 실행)
        if (newPassword) {
          await updatePassword(user, newPassword);
        }

        // (3) 로컬 UI 업데이트를 위해 localStorage도 갱신 (선택사항)
        const updatedDoc = await getDoc(userRef);
        localStorage.setItem("currentUser", JSON.stringify(updatedDoc.data()));

        alert("정보가 성공적으로 업데이트되었습니다.");
        window.location.reload();
      } catch (error) {
        console.error("업데이트 실패:", error);
        alert("수정 중 오류가 발생했습니다: " + error.message);
      }
    });
  }
});
