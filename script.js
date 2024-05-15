// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCC-LVJYx8c0yQZAbJto1D6Pqc4FF0jO08",
  authDomain: "scavengerhunt-a0e18.firebaseapp.com",
  projectId: "scavengerhunt-a0e18",
  storageBucket: "scavengerhunt-a0e18.appspot.com",
  messagingSenderId: "1057596154789",
  appId: "1:1057596154789:web:34ef0d1439ea04d48d3e4c",
  measurementId: "G-PLF992LLML"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

alert('here');


// Add event listener when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    alert('1');
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        alert('2');
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Get a reference to the Firestore database
        const db = firebase.firestore();
        alert('3');
        // Get the document from the users collection where the username matches the input username
        db.collection("Login").where("username", "==", username)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    alert('4');
                    // User with the provided username exists
                    const userDoc = querySnapshot.docs[0].data();
                    const storedPassword = userDoc.password;

                    // Compare the stored password with the input password
                    if (password === storedPassword) {
                        // Passwords match, redirect to dashboard
                        alert('Login successful!');
                        window.location.href = 'UserPage.html'; // Redirect to dashboard page
                    } else {
                        alert('Incorrect password!');
                    }
                } else {
                    alert('User not found!');
                }
            })
            .catch((error) => {
                console.error("Error fetching document: ", error);
            });
    });
});




