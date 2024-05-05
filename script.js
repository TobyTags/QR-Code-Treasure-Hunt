document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');

    const db = firebase.firestore();

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        clearErrors();
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        // Check if the username exists in Firestore
        db.collection("users").where("username", "==", username)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    usernameError.textContent = 'Username does not exist.';
                    return;
                }
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    // Check if the password matches
                    if (userData.password !== password) {
                        passwordError.textContent = 'Incorrect password.';
                        return;
                    }
                    // If username and password match, login successful
                    alert('Login successful!');
                });
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
            });
    });

    function clearErrors() {
        usernameError.textContent = '';
        passwordError.textContent = '';
    }
});
