// --- 사진 미리보기 기능 (선택된 사진을 동그라미 안에 보여줍니다) ---
const profilePicInput = document.getElementById("profilePic");
if (profilePicInput) {
  profilePicInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("파일 크기가 10MB를 초과합니다.");
        this.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profilePreview").innerHTML =
          `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    }
  });
}

// --- 회원가입 로직 ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // 관리자가 설정할 수 있는 기본 상태와 메모
    const status = "등록";
    const memo = "";
    const registerDate = new Date().toISOString().split("T")[0]; // 오늘 날짜 (YYYY-MM-DD)

    // 화면에서 입력받은 모든 값 모으기
    const newUser = {
      id: document.getElementById("signupId").value,
      password: document.getElementById("signupPassword").value,
      name: document.getElementById("signupName").value,
      gender: document.getElementById("signupGender").value,
      email: document.getElementById("signupEmail").value,
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
      status: status,
      memo: memo,
      registerDate: registerDate,
      // 관리자 확인용 (아이디에 admin이 들어가면 관리자 부여)
      role: document.getElementById("signupId").value.includes("admin") ? "admin" : "member",
    };

    let users = JSON.parse(localStorage.getItem("churchUsers")) || [];

    // 아이디 중복 검사
    if (users.find((user) => user.id === newUser.id)) {
      alert("이미 사용 중인 아이디입니다!");
      return;
    }

    users.push(newUser);
    localStorage.setItem("churchUsers", JSON.stringify(users));

    alert(`${newUser.name}님, 환영합니다! 로그인을 진행해주세요.`);
    window.location.href = "login.html";
  });
}

// --- 로그인 로직 (아이디 또는 이메일 둘 다 지원) ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // 방금 html에서 수정한 id="loginId" 값을 가져옵니다.
    const loginInput = document.getElementById("loginId").value;
    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("churchUsers")) || [];

    // ⭐️ 핵심: 입력한 값이 '아이디'와 같거나, '이메일'과 같으면 로그인 성공!
    const user = users.find(
      (u) => (u.id === loginInput || u.email === loginInput) && u.password === password,
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      alert(`${user.name}님 로그인 되셨습니다.`);
      if (user.role === "admin") {
        window.location.href = "members.html";
      } else {
        window.location.href = "../index.html";
      }
    } else {
      alert("아이디(이메일) 또는 비밀번호가 일치하지 않습니다.");
    }
  });
}
