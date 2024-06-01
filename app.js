const firebaseConfig = {
    
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore(); 

document.getElementById('toggle-signup').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('login-header').style.display = 'none'; 
});

document.getElementById('toggle-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-header').style.display = 'block'; 
});

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!validateEmail(email)) {
        document.getElementById('login-message').innerText = 'Por favor, insira um endereço de e-mail válido.';
        return;
    }

    if (!validatePassword(password)) {
        document.getElementById('login-message').innerText = 'A senha deve ter pelo menos 6 caracteres.';
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('login-message').innerText = 'Login bem-sucedido!';
        // Redireciona para index.html após o login bem-sucedido
        window.location.href = 'index.html';
    } catch (error) {
        document.getElementById('login-message').innerText = error.message;
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!validateEmail(email)) {
        document.getElementById('signup-message').innerText = 'Por favor, insira um endereço de e-mail válido.';
        return;
    }

    if (!validatePassword(password)) {
        document.getElementById('signup-message').innerText = 'A senha deve ter pelo menos 6 caracteres.';
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        document.getElementById('signup-message').innerText = 'Usuário cadastrado com sucesso!';
        
        // Após o cadastro bem-sucedido, adiciona os dados do usuário ao Firestore
        await firestore.collection('users').doc(userCredential.user.uid).set({
            email: email
        });

        // Redireciona para index.html após o cadastro bem-sucedido
        window.location.href = 'index.html';

    } catch (error) {
        document.getElementById('signup-message').innerText = error.message;
    }
});
