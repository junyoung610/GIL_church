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

// --- 1. 프로필 사진 미리보기 ---
const profilePicInput = document.getElementById("profilePic");
if (profilePicInput) {
  profilePicInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
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

// --- 2. 통합 회원가입 로직 (Firebase전용) ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const name = document.getElementById("signupName").value;

    try {
      // Firebase Auth에 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore 'users' 컬렉션에 상세 정보 저장
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        id: document.getElementById("signupId").value,
        name: name,
        gender: document.getElementById("signupGender").value,
        email: email,
        phone: document.getElementById("signupPhone").value,
        birth: document.getElementById("signupBirth").value,
        position: document.getElementById("signupPosition").value,
        group: document.getElementById("signupGroup").value,
        address: document.getElementById("signupAddress").value,
        addressDetail: document.getElementById("signupAddressDetail").value,
        role: email.includes("admin") ? "admin" : "member",
        registerDate: new Date().toISOString(),
        status: "등록",
      });

      alert(`${name}님, 회원가입이 완료되었습니다!`);
      window.location.href = "login.html";
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입 오류: " + error.message);
    }
  });
}

// --- 3. 로그인 로직 ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginId").value; // HTML의 id="loginId"를 이메일로 사용
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem("currentUser", JSON.stringify(userData));
        alert(`${userData.name}님 환영합니다!`);
        window.location.href = userData.role === "admin" ? "members.html" : "../index.html";
      }
    } catch (error) {
      alert("아이디(이메일) 또는 비밀번호를 확인해주세요.");
    }
  });
}
