// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Note: I removed my Firebase credentials from here for security reasons.

// This is for log in
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        //alert('Form submitted!'); // Display alert message

        // Check if the user exists and the password matches
        const q = query(collection(db, "Login"), where("username", "==", username));
        getDocs(q)
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0].data();
                    if (userDoc.password === password) {

                        // Save the username to local storage
                        localStorage.setItem('username', username);
                        
                        alert('Login successful!');
                        window.location.href = '/user'; 

                    } else {
                        alert('Incorrect password!');
                    }
                } else {
                    alert('User not found!');
                }
            })
            .catch((error) => {
                console.error("Error fetching document: ", error)
            });
    });
});


// this is for the sing up form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('signin-form');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission

        const username = document.getElementById('usernamelog').value.trim();
        const password = document.getElementById('passwordlog').value.trim();

        if (username && password) { // Check if fields are not empty
            try {
                // Check if the username already exists
                const q = query(collection(db, "Login"), where("username", "==", username));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    alert('Username already exists. Please pick a different name.');
                } else {
                    // If username does not exist, add the new user
                    const docRef = await addDoc(collection(db, "Login"), {
                        username: username,
                        password: password
                    });
                    console.log("Document written with ID: ", docRef.id);

                    // Save the username to local storage
                    localStorage.setItem('username', username);

                    alert('Sign up successful!');
                    window.location.href = '/user'; // Redirect to user page
                }
            } catch (e) {
                console.error("Error checking username or adding document: ", e);
                alert('Error signing up!');
            }
        } else {
            alert('Please fill in both username and password fields.');
        }
    });
});















// qr code saving belwo --------------

// Logout function
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("logout").addEventListener("click", function() {
        // Clear local storage
        localStorage.removeItem('username');
        // Redirect to index.html
        window.location.href = '/';
    });

    document.getElementById("addQRCode").addEventListener("click", function() {
        addQRCodeSection();
    });

});

function addQRCodeSection() {
    const container = document.createElement('div');

    const id = new Date().getTime(); // Use timestamp as a unique identifier

    // Store the generated ID in local storage
    storeQRCodeId(id);

    container.classList.add('container');
    container.classList.add('qr-container'); // Add a new class for specific styling
    container.setAttribute('data-id', id);
    container.innerHTML = `
        <div class="RealContainer">
            <input type="text" id="qrtext${id}" placeholder="Type here...">
            <div id="qrcode${id}">
                <img src="" id="qrImage${id}">
            </div>
            <button id="save3" onclick="saveQRCode('${id}')">Save and Generate QR Code</button>
            <button id="delete3" onclick="deleteQRCode('${id}')">Delete QR Code</button>
        </div>
    `;

    container.setAttribute('data-id', id); // this is for changing the value on the button

    document.body.appendChild(container);
    return id;
}



function addQRCodeSectionLoad(id) {
    const container = document.createElement('div');

    // Store the generated ID in local storage
    //storeQRCodeId(id);

    container.classList.add('container');
    container.classList.add('qr-container'); // Add a new class for specific styling
    container.setAttribute('data-id', id);
    container.innerHTML = `
        <div class="RealContainer">
            <input type="text" id="qrtext${id}" placeholder="Type here...">
            <div id="qrcode${id}">
                <img src="" id="qrImage${id}">
            </div>
            <button id="save3" onclick="saveQRCode('${id}')">Save and Generate QR Code</button>
            <button id="delete3" onclick="deleteQRCode('${id}')">Delete QR Code</button>
        </div>
    `;

    document.body.appendChild(container);
    return id;
}








//SAVING QR CODE ---------------------------------------------------

window.saveQRCode = function(id) {
    const qrtext = document.getElementById(`qrtext${id}`);
    const qrImage = document.getElementById(`qrImage${id}`);
    const qrData = qrtext.value;
  
    // Check if the text is empty
    if (!qrData.trim()) {
      alert('QR Code text cannot be empty.');
      return; // Exit the function if text is empty
    }
  
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
    qrImage.src = qrUrl;
  
    const username = localStorage.getItem('username'); // Retrieve username from local storage
  
    if (username) {
      const userRef = doc(db, 'users', username);
  
      runTransaction(db, transaction => {
        return transaction.get(userRef).then(docSnapshot => {
          if (docSnapshot.exists) {
            const existingData = docSnapshot.data();
            if (existingData) {
              const existingCodes = Object.values(existingData).filter(code => code.text === qrData);
              if (existingCodes.length > 0) {
                // Duplicate found, alert user
                alert('This QR Code text already exists. Please enter a unique text.');
                return; // Exit the transaction if duplicate found
              }
            }
          }
          // No duplicate found or document doesn't exist, proceed with saving
          return transaction.set(userRef, { [`qrCodeData${id}`]: { text: qrData, url: qrUrl } }, { merge: true });
        });
      })
      .then(() => {
        console.log("QR Code data saved successfully!");

      })
      .catch((error) => {
        console.error("Error saving QR Code data: ", error);
      });
    } else {
      alert('Username not found. Please log in again.');
    }
}









export function LoadQRData() {
    console.log("Loading QR data...");
    const username = localStorage.getItem('username'); // Retrieve username from local storage

    if (username) {
        // Fetch the QR data from Firestore
        getDoc(doc(db, 'users', username))
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    Object.keys(data).forEach(key => {
                        if (key.startsWith('qrCodeData')) {
                            const id = key.replace('qrCodeData', '');
                            //storeQRCodeId(id); //saving id to batlle issue with not being able to delete after reload due to lost id
                            addQRCodeSectionWithData(id, data[key].text, data[key].url);
                        }
                    });
                } else {
                    console.log("No QR data found for this user.");
                }
            })
            .catch((error) => {
                console.error("Error fetching QR Code data: ", error);
            });
    } else {
        alert('Username not found. Please log in again.');
    }
}

function storeQRCodeId(id) {
    let qrCodeIds = JSON.parse(localStorage.getItem('qrCodeIds')) || [];
    qrCodeIds.push(id); // Store both generated ID and data-id
    localStorage.setItem('qrCodeIds', JSON.stringify(qrCodeIds));
  }

function addQRCodeSectionWithData(id, text, url) {
    const generatedId = addQRCodeSectionLoad(id); // Create a new section and get its ID
    const qrtext = document.getElementById(`qrtext${generatedId}`);
    const qrImage = document.getElementById(`qrImage${generatedId}`);

    //storeQRCodeId(id); // Store both IDs

    if (qrtext && qrImage) {
        qrtext.value = text;
        qrImage.src = url;
    }
} 


//deleting containers --------
window.deleteQRCode = function(id) {
    const container = document.querySelector(`.container[data-id='${id}']`);
    if (container) {
      // Hide the container instead of removing it
      container.style.display = 'none';
    }
  
    const username = localStorage.getItem('username'); // Retrieve username from local storage
  
    if (username) {
      // Delete the QR data from Firestore using the generated ID
      const userDocRef = doc(db, 'users', username);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data[`qrCodeData${id}`]) {
              delete data[`qrCodeData${id}`];
  
              // Update the document with the remaining QR data
              setDoc(userDocRef, data)
                .then(() => {
                  console.log("QR Code data deleted successfully!");
                })
                .catch((error) => {
                  console.error("Error deleting QR Code data: ", error);
                });
            } else {
              console.log("No QR Code data found for this ID.");
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user document: ", error);
        });
  
      // Update or remove the mapping object in localStorage
      const qrCodeMapping = JSON.parse(localStorage.getItem('qrCodeMapping')) || {};
      if (qrCodeMapping[id]) {
        delete qrCodeMapping[id]; // Remove the mapping for the deleted QR Code
        localStorage.setItem('qrCodeMapping', JSON.stringify(qrCodeMapping));
      }
    } else {
      alert('Username not found. Please log in again.');
    }
}
  
  



// PRINTING CODE ---------------------------

const printBTN = document.getElementById('print');

printBTN.addEventListener('click', function() {
    window.print();
});
