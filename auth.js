// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBkrBLKuklZgPm1nz2G997ULiYycZMb9F8",
            authDomain: "avisoseeventos.firebaseapp.com",
            projectId: "avisoseeventos",
            storageBucket: "avisoseeventos.appspot.com",
            messagingSenderId: "247706769451",
            appId: "1:247706769451:web:ce31cd9d0ca22cd267b26e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Verifica a autenticação do usuário em cada página
auth.onAuthStateChanged(user => {
    const currentPage = window.location.pathname.split("/").pop();

    // Páginas que não exigem autenticação
    const publicPages = ["index.html", "login.html", "signup.html"];

    if (user) {
        // Usuário autenticado
        if (currentPage === "login.html" || currentPage === "signup.html") {
            // Se o usuário estiver autenticado, redireciona para a página principal
            window.location.href = "index.html";
        }
    } else {
        // Usuário não autenticado
        if (!publicPages.includes(currentPage)) {
            // Redireciona para a página de login se tentar acessar páginas protegidas
            window.location.href = "login.html";
        }
    }
});
