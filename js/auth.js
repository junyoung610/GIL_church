import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. 프로필 사진 미리보기 (로컬 UI 전용) ---
const profilePicInput = document.getElementById("profilePic");
if (profilePicInput) {
  profilePicInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB 제한
        alert("파일 크기가 10MB를 초과합니다.");
        this.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById("profilePreview");
        if (preview) {
          preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// --- 2. 통합 회원가입 로직 (Firebase Auth + Firestore) ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 필수 인증 정보
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const name = document.getElementById("signupName").value;

    try {
      // 1. Firebase Authentication에 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. 모든 교인 상세 정보를 Firestore 'users' 컬렉션에 저장
      // (Base64 사진 데이터는 용량 문제로 Firebase Storage 연동 전까지는 생략 권장)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        id: document.getElementById("signupId").value, // 사용자 지정 ID
        name: name,
        gender: document.getElementById("signupGender").value,
        email: email,
        phone: document.getElementById("signupPhone").value,
        birth: document.getElementById("signupBirth").value,
        position: document.getElementById("signupPosition").value,
        group: document.getElementById("signupGroup").value,
        zipcode: document.getElementById("signupZipcode").value,
        address: document.getElementById("signupAddress").value,
        addressDetail: document.getElementById("signupAddressDetail").value,
        baptismDate: document.getElementById("signupBaptismDate").value,
        infantBaptismDate: document.getElementById("signupInfantBaptismDate").value,
        confirmationDate: document.getElementById("signupConfirmationDate").value,
        status: "등록", // 초기 상태 기본값
        memo: "",
        registerDate: new Date().toISOString(),
        role: email.includes("admin") ? "admin" : "member", // 보안 규칙 기반 권한 설정
      });

      alert(`${name}님, 교적 등록이 완료되었습니다. 로그인을 진행해주세요.`);
      window.location.href = "login.html";
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("가입 중 오류가 발생했습니다: " + error.message);
    }
  });
}

// --- 3. 통합 로그인 로직 ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginInput = document.getElementById("loginId").value; // ID 또는 이메일
    const password = document.getElementById("loginPassword").value;

    try {
      // Firebase Auth는 기본적으로 이메일 로그인을 지원합니다.
      // (아이디 로그인을 위해서는 별도의 매핑 처리가 필요하나 우선 이메일 로그인을 권장합니다.)
      const userCredential = await signInWithEmailAndPassword(auth, loginInput, password);
      const user = userCredential.user;

      // Firestore에서 저장된 교인 정보 및 권한(role) 가져오기
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // 세션 유지를 위해 localStorage에 현재 사용자 정보 저장 (UI 표시용)
        localStorage.setItem("currentUser", JSON.stringify(userData));

        alert(`${userData.name}님, 평안한 하루 되세요.`);

        // 권한에 따른 페이지 이동
        window.location.href = userData.role === "admin" ? "members.html" : "../index.html";
      } else {
        throw new Error("교적 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("아이디/이메일 또는 비밀번호를 확인해주세요.");
    }
  });
}
